"use client"

import { ChatInterface } from "@/components/chat-interface"

export default function AssistantPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">المساعد الذكي</h1>
          <p className="text-muted-foreground">
            دعني أساعدك في اختيار الملابس المناسبة لك
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}