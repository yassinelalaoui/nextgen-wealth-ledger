export interface ClientDTO {
  id: number;
  name: string;
  email: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
}

export interface UpdateClientRequest {
  name: string;
  email: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
