import { GetServerSideProps } from "next"
import { Todo } from "../server/services/todo.service"
import { execute } from "../server/submodule"

type HomeProps = {
  todos: Todo[]
}

export default function Home(props: HomeProps) {
  return <div>{JSON.stringify(props.todos, undefined, 2)}</div>
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const todos = await execute(({ services }) => {
    return services.todoService.list()
  })

  return {
    props: {
      todos
    }
  }
}