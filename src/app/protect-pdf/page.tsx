
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Upload, Download, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from '@/components/ui/Logo';
import type { SecuritySettings } from '../edit-pdf/lib/types';
import { translations } from '@/lib/translations';
import LoadingState from '@/components/ui/LoadingState';
import SuccessState from '@/components/ui/SuccessState';


type ViewState = 'idle' | 'loading' | 'success';

export default function ProtectPdfPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [texts, setTexts] = useState(translations.zh);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [fileToProtect, setFileToProtect] = useState<File | null>(null);
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showOwnerPassword, setShowOwnerPassword] = useState(false);
    const [isAdvancedEnabled, setIsAdvancedEnabled] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const [settings, setSettings] = useState<SecuritySettings>({
        userPassword: '',
        ownerPassword: '',
        permissions: { allowPrinting: true, allowModifying: true, allowCopying: true }
    });

    const fileUploadRef = useRef<HTMLInputElement>(null);
    
    const [viewState, setViewState] = useState<ViewState>('idle');
    const [progress, setProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        try {
            const payloadString = sessionStorage.getItem('pdfForProtection');
            if (payloadString) {
                const payload = JSON.parse(payloadString);
                fetch(payload.dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], payload.fileName || "edited-document.pdf", { type: "application/pdf" });
                        setFileToProtect(file);
                        setFileName(file.name);
                    });
            }
        } catch (error) {
            console.error("Failed to load PDF from session storage:", error);
            toast({ title: "Error", description: "Could not load the document from the previous page.", variant: "destructive" });
        }

        if (typeof window !== 'undefined') {
          const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
          setIsLoggedIn(loggedInStatus);
        }
    }, [toast]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setFileToProtect(file);
            setFileName(file.name);
        } else if (file) {
            toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc, variant: 'destructive' });
        }
    };
    
    const resetPage = () => {
        setViewState('idle');
        setProgress(0);
        setLoadingMessage('');
        setSuccessMessage('');
        setFileToProtect(null);
        setFileName(null);
        setSettings({ userPassword: '', ownerPassword: '', permissions: { allowPrinting: true, allowModifying: true, allowCopying: true }});
        setIsAdvancedEnabled(false);
        if (fileUploadRef.current) fileUploadRef.current.value = '';
        sessionStorage.removeItem('pdfForProtection');
    };

    const handleStartLoading = (message: string) => {
        setLoadingMessage(message);
        setViewState('loading');
        setProgress(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return prev;
                }
                return prev + 5;
            });
        }, 200);
    };

    const handleSuccess = (message: string) => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setProgress(100);
        setTimeout(() => {
            setSuccessMessage(message);
            setViewState('success');
        }, 300);
    };

    const handleError = (message: string) => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setViewState('idle');
        toast({ title: texts.encryptionError, description: message, variant: 'destructive' });
    };

    const handleEncrypt = async () => {
        if (!fileToProtect) {
            handleError(texts.noFileError);
            return;
        }
        if (!settings.userPassword) {
            handleError(texts.passwordRequiredError);
            return;
        }
        if (isAdvancedEnabled && !settings.ownerPassword) {
            handleError(texts.ownerPasswordRequiredError);
            return;
        }

        handleStartLoading(texts.loadingEncryptingFile);
        const formData = new FormData();
        formData.append("file", fileToProtect);
        formData.append("format", "restrict");
        formData.append("user_password", settings.userPassword);
        if (isAdvancedEnabled && settings.ownerPassword) {
            formData.append("owner_password", settings.ownerPassword);
        }
        
        formData.append("allow_printing", isAdvancedEnabled ? (settings.permissions.allowPrinting ? '1' : '0') : '1');
        formData.append("allow_modifying", isAdvancedEnabled ? (settings.permissions.allowModifying ? '1' : '0') : '1');
        formData.append("allow_copying", isAdvancedEnabled ? (settings.permissions.allowCopying ? '1' : '0') : '1');

        try {
            const response = await fetch("https://pdfsolution.dpdns.org/upload", {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Encryption failed: ${errorText}`);
            }
            
            const resBlob = await response.blob();
            const url = URL.createObjectURL(resBlob);
            const a = document.createElement('a');
            const downloadFilename = `protected_${fileName || 'document.pdf'}`;
            a.href = url;
            a.download = downloadFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            handleSuccess(texts.encryptionSuccessDesc);
            sessionStorage.removeItem('pdfForProtection');

        } catch (err: any) {
             handleError(err.message);
        }
    };
    
    const renderContent = () => {
        switch(viewState) {
            case 'loading':
                return <LoadingState message={loadingMessage} progress={progress} />;
            case 'success':
                return <SuccessState message={successMessage} onGoHome={() => router.push('/')} onStartNew={resetPage} texts={texts} />;
            case 'idle':
            default:
                return (
                    <div className="w-full max-w-4xl space-y-6">
                        {!fileToProtect ? (
                          <Card className="w-full max-w-2xl mx-auto">
                            <CardHeader className="text-center">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    <ShieldCheck className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle>{texts.protectPdfTitle}</CardTitle>
                                <CardDescription>{texts.startDescription}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div 
                                  className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                                  onClick={() => fileUploadRef.current?.click()}
                                >
                                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-md text-muted-foreground text-center">{texts.uploadButton}</p>
                                    <Input
                                        type="file"
                                        ref={fileUploadRef}
                                        onChange={handleFileChange}
                                        accept="application/pdf"
                                        className="hidden"
                                    />
                                </div>
                            </CardContent>
                          </Card>
                        ) : (
                        <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">{texts.securitySettingsTitle}</CardTitle>
                                <CardDescription>{texts.protectPdfDescription}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 border rounded-md bg-muted/50 mb-6">
                                    <p className="text-sm font-medium">{texts.fileToProtectLabel}</p>
                                    <p className="text-muted-foreground truncate">{fileName}</p>
                                </div>

                                <div className="space-y-4">
                                   <div className="space-y-2">
                                        <Label htmlFor="user_password">{texts.openPasswordLabel}</Label>
                                        <div className="relative">
                                        <Input
                                            id="user_password"
                                            type={showUserPassword ? 'text' : 'password'}
                                            value={settings.userPassword || ''}
                                            onChange={(e) => setSettings(p => ({...p, userPassword: e.target.value}))}
                                            placeholder={texts.openPasswordPlaceholder}
                                        />
                                         <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowUserPassword(p => !p)}>
                                            {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                         </Button>
                                        </div>
                                   </div>
                                   <div className="flex items-center space-x-2 pt-2">
                                        <Switch id="advanced-security" checked={isAdvancedEnabled} onCheckedChange={setIsAdvancedEnabled} />
                                        <Label htmlFor="advanced-security" className="flex items-center gap-2 font-medium cursor-pointer">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            <span>{texts.enablePermissionsLabel}</span>
                                        </Label>
                                   </div>
                                   <p className="text-xs text-muted-foreground pl-12 -mt-1">{texts.advancedPermissionsDesc}</p>
                                   
                                   {isAdvancedEnabled && (
                                    <div className="space-y-4 pl-8 border-l-2 ml-4 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="owner_password">{texts.ownerPasswordLabel}</Label>
                                            <div className="relative">
                                            <Input
                                                id="owner_password"
                                                type={showOwnerPassword ? 'text' : 'password'}
                                                value={settings.ownerPassword || ''}
                                                onChange={(e) => setSettings(p => ({...p, ownerPassword: e.target.value}))}
                                                placeholder={texts.ownerPasswordPlaceholder}
                                            />
                                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowOwnerPassword(p => !p)}>
                                                {showOwnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                             </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{texts.permissionsTitle}</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="disallow-printing" checked={!settings.permissions.allowPrinting} onCheckedChange={(checked) => setSettings(p => ({...p, permissions: {...p.permissions, allowPrinting: !Boolean(checked)}}))} />
                                                <Label htmlFor="disallow-printing">{texts.disallowPrinting}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="disallow-modifying" checked={!settings.permissions.allowModifying} onCheckedChange={(checked) => setSettings(p => ({...p, permissions: {...p.permissions, allowModifying: !Boolean(checked)}}))} />
                                                <Label htmlFor="disallow-modifying">{texts.disallowModifying}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="disallow-copying" checked={!settings.permissions.allowCopying} onCheckedChange={(checked) => setSettings(p => ({...p, permissions: {...p.permissions, allowCopying: !Boolean(checked)}}))} />
                                                <Label htmlFor="disallow-copying">{texts.disallowCopying}</Label>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                               <Button className="w-auto" onClick={handleEncrypt}>
                                    <Download className="mr-2 h-4 w-4" />
                                    {texts.encryptButton}
                               </Button>
                            </CardFooter>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>{texts.infoTitle}</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span>{texts.encryptionInfo1}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span>{texts.encryptionInfo2}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                    <span>{texts.encryptionWarning}</span>
                                </div>
                            </CardContent>
                        </Card>
                        </>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <div className="flex flex-col h-screen bg-background">
          <header className="p-0 border-b bg-card sticky top-0 z-40 flex-shrink-0">
             <div className="container mx-auto flex justify-between items-center h-20">
                <div className="flex items-center gap-6">
                    <div className="cursor-pointer" onClick={() => router.push('/')}>
                        <Logo />
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Button variant={'en' === 'en' ? "secondary" : "outline"} size="sm">English</Button>
                        <Button variant={'zh' === 'zh' ? "secondary" : "outline"} size="sm">中文</Button>
                    </div>
                 </div>
             </div>
          </header>

          <main className="flex-grow p-6 overflow-y-auto flex items-center justify-center">
             {renderContent()}
          </main>
        </div>
    );
}
