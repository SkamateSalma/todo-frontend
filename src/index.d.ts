export interface Task {
  id: number,
  name: string,
  createdAt: string,
  updatedAt: string,
  isDone: boolean,
  deadline: string | null,
}
