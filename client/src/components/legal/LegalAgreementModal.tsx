import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Scroll, ArrowDown } from "lucide-react";
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

interface LegalAgreementModalProps {
  type: 'terms' | 'privacy';
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function LegalAgreementModal({ type, open, onClose, onAgree }: LegalAgreementModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreeClicked, setAgreeClicked] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset states when modal opens
    if (open) {
      setHasScrolledToBottom(false);
      setAgreeClicked(false);
    }
  }, [open]);

  const checkIfScrolledToBottom = () => {
    if (!viewportRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAgree = () => {
    if (!hasScrolledToBottom) return;
    
    setAgreeClicked(true);
    setTimeout(() => {
      onAgree();
      onClose();
    }, 500); // Brief animation delay
  };

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const description = type === 'terms' 
    ? 'Please read our Terms of Service carefully before agreeing.'
    : 'Please read our Privacy Policy to understand how we protect your data.';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Scroll className="h-5 w-5 text-blue-600" />
            <span>{title}</span>
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        </DialogHeader>

        <div className="flex-1 relative">
          <ScrollArea 
            className="h-full pr-4"
            ref={scrollAreaRef}
          >
            <div 
              ref={viewportRef}
              onScroll={checkIfScrolledToBottom}
              className="max-h-full overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {type === 'terms' ? <TermsOfService /> : <PrivacyPolicy />}
              </div>
            </div>
          </ScrollArea>

          {/* Scroll to bottom indicator */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-4 right-4 animate-bounce">
              <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Gradient overlay at bottom when not scrolled */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-0 left-0 right-4 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            {hasScrolledToBottom ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  You have read the entire document
                </span>
              </>
            ) : (
              <>
                <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                <span className="text-gray-500">
                  Please scroll to the bottom to continue
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={agreeClicked}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleAgree}
              disabled={!hasScrolledToBottom || agreeClicked}
              className={`min-w-[100px] ${agreeClicked ? 'bg-green-600 hover:bg-green-600' : ''}`}
              data-testid={`button-agree-${type}`}
            >
              {agreeClicked ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Agreed
                </>
              ) : (
                'I Agree'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}