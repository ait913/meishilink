import Dexie, { type Table } from "dexie";

import type { SavedContact } from "@/lib/zod-schemas";

export class MeishiLinkDB extends Dexie {
  contacts!: Table<SavedContact, string>;

  constructor() {
    super("meishilink");
    this.version(1).stores({
      contacts: "&id, handle, savedAt",
    });
  }
}

export const db = new MeishiLinkDB();

