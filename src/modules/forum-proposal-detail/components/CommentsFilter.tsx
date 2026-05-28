'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type FilterMode = 'all' | 'by_address';

type CommentsFilterProps = {
  mode: FilterMode;
  authorAddress: string;
  onModeChange: (mode: FilterMode) => void;
  onAuthorAddressChange: (address: string) => void;
};

export function CommentsFilter({ mode, authorAddress, onModeChange, onAuthorAddressChange }: CommentsFilterProps) {
  const [inputValue, setInputValue] = useState(authorAddress);

  useEffect(() => {
    if (mode !== 'by_address') return;
    const timer = setTimeout(() => {
      onAuthorAddressChange(inputValue.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, mode, onAuthorAddressChange]);

  useEffect(() => {
    if (authorAddress === '') setInputValue('');
  }, [authorAddress]);

  const handleModeChange = (value: FilterMode) => {
    onModeChange(value);
    if (value !== 'by_address') {
      onAuthorAddressChange('');
      setInputValue('');
    }
  };

  return (
    <div className='flex flex-col gap-3'>
      <RadioGroup
        value={mode}
        onValueChange={(v) => handleModeChange(v as FilterMode)}
        className='flex flex-wrap gap-4'
      >
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='all' id='filter-top-level' />
          <Label htmlFor='filter-top-level' className='cursor-pointer'>
            All comments
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='by_address' id='filter-by-address' />
          <Label htmlFor='filter-by-address' className='cursor-pointer'>
            By address
          </Label>
        </div>
      </RadioGroup>

      {mode === 'by_address' && (
        <div className='relative max-w-sm'>
          <Input
            placeholder='Filter by address (0x…)'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className='pr-8'
            autoFocus
          />
          {inputValue && (
            <Button
              variant='ghost'
              size='icon'
              className='-translate-y-1/2 absolute top-1/2 right-1 size-7 text-muted-foreground hover:text-foreground'
              onClick={() => {
                setInputValue('');
                onAuthorAddressChange('');
              }}
              aria-label='Clear address filter'
            >
              <X className='size-3.5' />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
