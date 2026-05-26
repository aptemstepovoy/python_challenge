"use client";

import { create } from "zustand";

type UIState = {
  talentsOpen: boolean;
  inventoryOpen: boolean;
  setTalentsOpen: (o: boolean) => void;
  setInventoryOpen: (o: boolean) => void;
};

/**
 * Эфемерное UI-состояние для глобальных модалок.
 * Намеренно НЕ персистится — отдельно от основного operator-store.
 * Используется, когда модалку нужно открыть из глубоко вложенного
 * компонента (типа UserMenu Dialog), а сама модалка должна
 * рендериться на корневом уровне (AppShell), а не как nested Dialog.
 */
export const useUIStore = create<UIState>((set) => ({
  talentsOpen: false,
  inventoryOpen: false,
  setTalentsOpen: (o) => set({ talentsOpen: o }),
  setInventoryOpen: (o) => set({ inventoryOpen: o }),
}));
