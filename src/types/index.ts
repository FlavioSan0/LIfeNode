export type SelectOption = {
  id: string;
  name: string;
  color?: string | null;
};

export type ActionResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };
