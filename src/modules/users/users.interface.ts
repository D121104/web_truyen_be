export interface IUser {
  _id: string
  name: string
  email: string
  role: string
  coin: number
  avatar: string
  books?: string[]
  chapters?: string[]
}
