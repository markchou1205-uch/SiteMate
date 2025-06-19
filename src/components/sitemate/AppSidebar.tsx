
"use client";

import type { ChangeEvent, FormEvent } from "react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, LayoutDashboard, Layers, FileText, HelpCircle } from "lucide-react";
import type { SuggestSiteLayoutOutput } from "@/ai/flows/suggest-site-layout";
import type { SuggestPageTemplatesOutput } from "@/ai/flows/suggest-page-templates";
import Image from "next/image";

interface AppSidebarProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  siteLayout: SuggestSiteLayoutOutput | null;
  templateSuggestions: SuggestPageTemplatesOutput | null;
  onGenerateLayout: () => Promise<void>;
  onSuggestTemplates: () => Promise<void>;
  isGeneratingLayout: boolean;
  isSuggestingTemplates: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  topic,
  onTopicChange,
  siteLayout,
  templateSuggestions,
  onGenerateLayout,
  onSuggestTemplates,
  isGeneratingLayout,
  isSuggestingTemplates,
}) => {
  const [currentTopic, setCurrentTopic] = useState(topic);

  const handleTopicInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentTopic(e.target.value);
  };

  const handleGenerateLayoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onTopicChange(currentTopic); // Update parent state before generating
    await onGenerateLayout();
  };

  return (
    <aside className="w-96 bg-card text-card-foreground p-6 shadow-xl flex flex-col space-y-6 overflow-y-auto border-r">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-headline font-semibold">SiteMate</h1>
      </div>

      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span>AI Site Tools</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <form onSubmit={handleGenerateLayoutSubmit} className="space-y-4">
              <div>
                <Label htmlFor="website-topic" className="text-sm font-medium">
                  Website Topic
                </Label>
                <Input
                  id="website-topic"
                  type="text"
                  value={currentTopic}
                  onChange={handleTopicInputChange}
                  placeholder="e.g., Bakery, Portfolio, SaaS"
                  className="mt-1"
                  aria-describedby="topic-description"
                />
                <p id="topic-description" className="text-xs text-muted-foreground mt-1">
                  Describe the main purpose or subject of your website.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isGeneratingLayout || !currentTopic.trim()}>
                {isGeneratingLayout ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Site Layout
              </Button>
            </form>

            {siteLayout && (
              <Card className="bg-background/50">
                <CardHeader>
                  <CardTitle className="text-md flex items-center"><FileText className="w-4 h-4 mr-2 text-accent"/>Generated Layout</CardTitle>
                  <CardDescription>Based on topic: &quot;{topic}&quot;</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-foreground">Sections:</h4>
                    {siteLayout.sections.length > 0 ? (
                      <ul className="list-disc list-inside pl-2 text-muted-foreground">
                        {siteLayout.sections.map((section, index) => (
                          <li key={`section-${index}`}>{section}</li>
                        ))}
                      </ul>
                    ) : <p className="text-muted-foreground text-xs italic">No sections suggested.</p>}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Pages:</h4>
                     {siteLayout.pages.length > 0 ? (
                      <ul className="list-disc list-inside pl-2 text-muted-foreground">
                        {siteLayout.pages.map((page, index) => (
                          <li key={`page-${index}`}>{page}</li>
                        ))}
                      </ul>
                    ) : <p className="text-muted-foreground text-xs italic">No pages suggested.</p>}
                  </div>
                  <Button onClick={onSuggestTemplates} className="w-full mt-4" variant="outline" disabled={isSuggestingTemplates}>
                    {isSuggestingTemplates ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4 text-accent" />
                    )}
                    Suggest Templates
                  </Button>
                </CardContent>
              </Card>
            )}

            {templateSuggestions && (
              <Card className="bg-background/50">
                <CardHeader>
                  <CardTitle className="text-md flex items-center"><Layers className="w-4 h-4 mr-2 text-accent"/>Template Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {Object.entries(templateSuggestions).map(([page, template]) => (
                    <div key={page} className="flex justify-between">
                      <span className="font-medium text-foreground">{page}:</span>
                      <span className="text-muted-foreground">{template}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>Template Library</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Browse professionally designed templates.
            </p>
            {[
              { name: "Modern Portfolio", img: "abstract modern", category: "Portfolio" },
              { name: "E-commerce Storefront", img: "retail online", category: "E-commerce" },
              { name: "Restaurant Landing", img: "food gourmet", category: "Business" },
              { name: "Blog Minimalist", img: "writing desk", category: "Blog" },
            ].map((template, index) => (
              <Card key={index} className="overflow-hidden transition-shadow hover:shadow-md">
                <Image 
                  src={`https://placehold.co/300x150.png`} 
                  alt={template.name} 
                  width={300} 
                  height={150} 
                  className="w-full h-auto object-cover"
                  data-ai-hint={template.img}
                />
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm text-foreground">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.category}</p>
                </CardContent>
              </Card>
            ))}
             <Button variant="outline" className="w-full">Browse All Templates</Button>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Help & Documentation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
             <p className="text-sm text-muted-foreground">
              Find guides and tutorials here. (Placeholder)
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default AppSidebar;
