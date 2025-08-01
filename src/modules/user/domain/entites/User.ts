export interface UserProps {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role?: number
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id?: number;
  public username: string;
  public email: string;
  public password?: string;
  public role?:number
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
} 