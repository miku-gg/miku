import { GiScrollQuill } from 'react-icons/gi';
import './TaskList.scss';
import classNames from 'classnames';

interface Task {
  id: string;
  text: string;
  checked: boolean;
}

const tasks: Task[] = [
  {
    id: '1',
    text: 'Ask Seraphina about the forest.',
    checked: false,
  },
  {
    id: '2',
    text: 'Help Seraphina find the key.',
    checked: false,
  },
  {
    id: '3',
    text: 'Invite Seraphina to the party.',
    checked: true,
  },
];

export default function TaskList() {
  return (
    <div className="TaskList">
      <div className="TaskList__trigger">
        <GiScrollQuill />
      </div>
      <div className="TaskList__popup">
        <div className="TaskList__tasks">
          {tasks.map((task) => (
            <div
              key={`${task}-${task.id}`}
              className={classNames('TaskList__task', task.checked ? 'TaskList__task--checked' : '')}
            >
              <div className="TaskList__task-check">
                <GiScrollQuill />
              </div>
              <div className="TaskList__task-text">
                <span>{task.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
