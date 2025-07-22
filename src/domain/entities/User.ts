export interface UserProps {
  id?: number;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id?: number;
  public name: string;
  public email: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
} 