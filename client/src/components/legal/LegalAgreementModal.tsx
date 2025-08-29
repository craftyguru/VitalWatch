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
      // Also check scroll position after content loads
      setTimeout(() => {
        checkIfScrolledToBottom();
      }, 100);
    }
  }, [open]);

  const checkIfScrolledToBottom = () => {
    if (!viewportRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    
    // If content is shorter than container, no scrolling needed
    const noScrollNeeded = scrollHeight <= clientHeight + 5;
    
    // Check if scrolled to bottom with tolerance
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 30; // 30px tolerance
    
    console.log('Scroll check:', { 
      scrollTop, 
      scrollHeight, 
      clientHeight, 
      isAtBottom, 
      noScrollNeeded,
      shouldEnable: isAtBottom || noScrollNeeded 
    });
    
    if ((isAtBottom || noScrollNeeded) && !hasScrolledToBottom) {
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
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] sm:h-[80vh] flex flex-col mx-2">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Scroll className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>{title}</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        </DialogHeader>

        <div className="flex-1 relative min-h-0">
          <div 
            ref={viewportRef}
            onScroll={checkIfScrolledToBottom}
            className="h-full overflow-y-auto pr-2 sm:pr-4"
          >
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              {type === 'terms' ? <TermsOfService /> : <PrivacyPolicy />}
            </div>
          </div>

          {/* Scroll to bottom indicator */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 animate-bounce">
              <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg">
                <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>
          )}

          {/* Gradient overlay at bottom when not scrolled */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-0 left-0 right-2 sm:right-4 h-12 sm:h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>

        <div className="border-t pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            {hasScrolledToBottom ? (
              <>
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <span className="text-green-600 font-medium">
                  You have read the entire document
                </span>
              </>
            ) : (
              <>
                <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                <span className="text-gray-500">
                  Please scroll to the bottom to continue
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={agreeClicked}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleAgree}
              disabled={!hasScrolledToBottom || agreeClicked}
              size="sm"
              className={`min-w-[80px] sm:min-w-[100px] flex-1 sm:flex-none ${agreeClicked ? 'bg-green-600 hover:bg-green-600' : ''}`}
              data-testid={`button-agree-${type}`}
            >
              {agreeClicked ? (
                <>
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Agreed</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">I Agree</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}