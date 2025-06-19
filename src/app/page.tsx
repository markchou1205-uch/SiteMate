
"use client";

import React, { useState, useCallback } from "react";
import AppSidebar from "@/components/sitemate/AppSidebar";
import AppHeader from "@/components/sitemate/AppHeader";
import MainWorkspace from "@/components/sitemate/MainWorkspace";
import { useToast } from "@/hooks/use-toast";
import { suggestSiteLayout, type SuggestSiteLayoutOutput } from "@/ai/flows/suggest-site-layout";
import { suggestPageTemplates, type SuggestPageTemplatesOutput } from "@/ai/flows/suggest-page-templates";

export default function SiteMatePage() {
  const [topic, setTopic] = useState<string>("");
  const [siteLayout, setSiteLayout] = useState<SuggestSiteLayoutOutput | null>(null);
  const [templateSuggestions, setTemplateSuggestions] = useState<SuggestPageTemplatesOutput | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);
  const [isSuggestingTemplates, setIsSuggestingTemplates] = useState(false);

  const { toast } = useToast();

  const handleTopicChange = useCallback((newTopic: string) => {
    setTopic(newTopic);
    // Reset downstream states when topic changes significantly
    if (newTopic !== topic) {
        setSiteLayout(null);
        setTemplateSuggestions(null);
    }
  }, [topic]);

  const handleGenerateLayout = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a website topic to generate a layout.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingLayout(true);
    setSiteLayout(null); // Clear previous layout
    setTemplateSuggestions(null); // Clear previous suggestions
    try {
      const layout = await suggestSiteLayout({ topic });
      setSiteLayout(layout);
      toast({
        title: "Layout Generated",
        description: "Site structure suggested successfully.",
      });
    } catch (error) {
      console.error("Error generating site layout:", error);
      toast({
        title: "Error Generating Layout",
        description: "Could not generate site layout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLayout(false);
    }
  };

  const handleSuggestTemplates = async () => {
    if (!siteLayout || !topic) {
      toast({
        title: "Layout and Topic Required",
        description: "Please generate a site layout first.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggestingTemplates(true);
    setTemplateSuggestions(null); // Clear previous suggestions
    try {
      const suggestions = await suggestPageTemplates({ topic, layout: siteLayout.pages });
      setTemplateSuggestions(suggestions);
      toast({
        title: "Templates Suggested",
        description: "Page template suggestions provided.",
      });
    } catch (error) {
      console.error("Error suggesting templates:", error);
      toast({
        title: "Error Suggesting Templates",
        description: "Could not suggest templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTemplates(false);
    }
  };

  const handleDeploy = () => {
    toast({
      title: "Deployment Initiated (Demo)",
      description: "Your website deployment process has started!",
    });
    // Placeholder for actual deployment logic
  };

  const currentPageTitle = siteLayout?.pages?.[0] || "Home Page";


  return (
    <div className="flex h-screen bg-background text-foreground font-body antialiased_">
      <AppSidebar
        topic={topic}
        onTopicChange={handleTopicChange}
        siteLayout={siteLayout}
        templateSuggestions={templateSuggestions}
        onGenerateLayout={handleGenerateLayout}
        onSuggestTemplates={handleSuggestTemplates}
        isGeneratingLayout={isGeneratingLayout}
        isSuggestingTemplates={isSuggestingTemplates}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          onDeploy={handleDeploy}
        />
        <MainWorkspace previewMode={previewMode} currentPageTitle={currentPageTitle} />
      </div>
    </div>
  );
}
