'use client';

import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import { useDistrictSearch } from '@/entities/location';

interface LocationSearchInputProps {
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearchInput({
  onSelect,
  placeholder = '지역을 검색하세요',
  className,
}: LocationSearchInputProps) {
  const { query, setQuery, results } = useDistrictSearch();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Map to store original district values by their lowercase keys
  const districtMap = React.useMemo(() => {
    const map = new Map<string, string>();
    results.forEach((district) => {
      map.set(district.toLowerCase(), district);
    });
    return map;
  }, [results]);

  const handleSelect = React.useCallback(
    (value: string) => {
      // cmdk passes lowercase value, so we look up the original
      const originalValue = districtMap.get(value.toLowerCase()) || value;
      onSelect(originalValue);
      setQuery('');
      setOpen(false);
    },
    [onSelect, setQuery, districtMap]
  );

  const handleInputChange = React.useCallback(
    (value: string) => {
      setQuery(value);
      setOpen(value.trim().length > 0);
    },
    [setQuery]
  );

  if (!mounted) {
    return (
      <div className={className}>
        <div className="border rounded-lg">
          <div className="flex h-9 items-center gap-2 border-b px-3">
            <div className="size-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={placeholder}
              disabled
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Command shouldFilter={false} className="border rounded-lg">
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={handleInputChange}
        />
        {open && results.length > 0 && (
          <CommandList className="max-h-[200px] border-t">
            <CommandGroup>
              {results.map((district) => (
                <CommandItem
                  key={district}
                  value={district}
                  onSelect={handleSelect}
                >
                  {district.replace(/-/g, ' > ')}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
        {open && results.length === 0 && query.trim().length > 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground border-t">
            검색 결과가 없습니다
          </div>
        )}
      </Command>
    </div>
  );
}
