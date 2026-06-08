export interface ApnVO {
  id: string | number;
  name: string;
  apn: string;
  local: string;
  creationTime: string;
}

export interface ApnForm {
  id?: string | number;
  name?: string;
  apn?: string;
  local?: string;
}
