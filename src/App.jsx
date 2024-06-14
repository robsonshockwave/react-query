import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import './App.css';

function App() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery(
    'todos',
    () => {
      return axios.get('http://localhost:8080/todos').then((res) => res.data);
    },
    {
      retry: 5,
      refetchOnWindowFocus: true,
      refetchInterval: 50000,
      // initialData: [
      //   {
      //     id: 1,
      //     title: 'Todo 1',
      //     completed: false,
      //   },
      // ],
    }
  );

  const mutation = useMutation({
    mutationFn: ({ todoId, completed }) => {
      return axios
        .patch(`http://localhost:8080/todos/${todoId}`, {
          completed,
        })
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      // refetch();
      queryClient.setQueryData('todos', (oldData) => {
        return oldData.map((todo) => {
          if (todo.id === data.id) {
            return data;
          }
          return todo;
        });
      });
    },
    onError: (error) => {
      console.log('onError', error);
    },
  });

  console.log(mutation.isLoading);

  if (isLoading) return <div className="loading">Loading...</div>;

  if (error)
    return <div className="loading">An error occurred: {error.message}</div>;

  return (
    <div className="app-container">
      <div className="todos">
        <h2>Todos & React Query</h2>
        {data?.map((todo) => (
          <div
            onClick={() => {
              mutation.mutate({
                todoId: todo.id,
                completed: !todo.completed,
              });
            }}
            className={`todo ${todo.completed && 'todo-completed'}`}
            key={todo.id}
          >
            {todo.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
