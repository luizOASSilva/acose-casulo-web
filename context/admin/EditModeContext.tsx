'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type EditableType = 'activity' | 'article' | 'partner' | null;

interface SelectedItem {
  type: EditableType;
  id: string | number;
  data: Record<string, any>;
}

interface EditModeContextType {
  isEditMode: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
  selectedItem: SelectedItem | null;
  selectItem: (item: SelectedItem) => void;
  clearSelection: () => void;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function EditModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('edit-mode');
    if (stored === 'true') {
      setIsEditMode(() => true); 
    }
  }, []);

  function enterEditMode() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edit-mode', 'true');
    }
    setIsEditMode(true);
  }

  function exitEditMode() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('edit-mode');
    }
    setIsEditMode(false);
    setSelectedItem(null);
  }

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        enterEditMode,
        exitEditMode,
        selectedItem,
        selectItem: setSelectedItem,
        clearSelection: () => setSelectedItem(null),
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);

  if (!ctx) {
    throw new Error(
      'useEditMode must be used within EditModeProvider'
    );
  }

  return ctx;
}
