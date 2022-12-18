export type Person = {
  id?: string;
  title: string;
  name: {
    first: string;
    last: string;
  };
  marketing: boolean;
  identifier: string;
};
