// This is a simple example Widget to get you started with Übersicht.
// For the full documentation please visit:
// https://github.com/felixhageloh/uebersicht

// You can modify this widget as you see fit, or simply delete this file to
// remove it.

import { React } from "uebersicht";

interface Todo {
  completed: boolean;
  priority?: string;
  completedOn?: Date;
  createdOn?: Date;
  description: string;
  projects: string[];
  contexts: string[];
  tags: Record<string, string | Date>;
}

const priorityMatcher = new RegExp(/^\(([A-Z])\)$/);
const dateMatcher = new RegExp(/^([0-9]{4}-[0-9]{2}-[0-9]{2})$/);
const projectMatcher = new RegExp(/^\+([^+]+)$/);
const contextMatcher = new RegExp(/^@([^@]+)$/);
const tagMatcher = new RegExp(/^([^\s:]+):([^\s:]+)$/);

const isRecord = (data: unknown): data is Record<string, unknown> =>
  data !== null &&
  typeof data === "object";

const isRegExpMatchArray = (data: unknown): data is RegExpMatchArray =>
  isRecord(data) &&
  Array.isArray(data);

const parseTodo = (entry: string): Todo => {
  const parts = entry.split(" ");

  // extract completed state
  const completed = parts[0] === "x";
  if (completed) {
    parts.shift();
  }

  // extract priority
  let priority: string | undefined = undefined;
  const priorityMatches = parts[0].match(priorityMatcher);
  if (priorityMatches !== null) {
    priority = priorityMatches[1];
    parts.shift();
  }

  // extract dates
  let completedOn: Date | undefined = undefined;
  let createdOn: Date | undefined = undefined;
  const dates: RegExpMatchArray[] = parts.slice(0, 2).
    map(part => part.match(dateMatcher)).
    filter(isRegExpMatchArray).
    filter(match => match.length >= 2);

  if (dates.length == 2) {
    completedOn = new Date(dates[0][1]);
    createdOn = new Date(dates[1][1]);
    parts.shift();
    parts.shift();
  } else if (dates.length == 1) {
    createdOn = new Date(dates[0][1]);
    parts.shift();
  }

  // extract description and tags
  let description: string[] = [];
  let projects: string[] = [];
  let contexts: string[] = [];
  let tags: Record<string, string | Date> = {};

  while (parts.length > 0) {
    const part = parts.shift();
    if (typeof part === "undefined") break;

    if (part.startsWith("@")) {
      const matches = part.match(contextMatcher);
      if (matches !== null && matches.length === 2) {
        contexts.push(matches[1]);
      }
      continue;
    }

    // match projects
    if (part.startsWith("+")) {
      const matches = part.match(projectMatcher);
      if (matches !== null && matches.length === 2) {
        projects.push(matches[1]);
      }
      continue;
    }

    // match URLs before tags
    if (part.includes("://")) {
      description.push(part);
      continue;
    }

    if (part.includes(":")) {
      const matches = part.match(tagMatcher);
      if (matches !== null && matches.length === 3) {
        tags[matches[1]] = matches[2];
        continue;
      }
    }

    description.push(part);
  }

  console.debug("parsed entry", entry);
  console.debug("projects", projects);
  console.debug("contexts", contexts);
  console.debug("tags", tags);
  return {
    completed,
    priority,
    completedOn,
    createdOn,
    description: description.join(" "),
    projects,
    contexts,
    tags,
  } as Todo;
};

interface TodoViewProps {
  todo: Todo;
}
const TodoView = ({ todo }: TodoViewProps) => {
  return (
    <div style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
      {todo.priority && <>
        <span>({todo.priority})</span>
        &nbsp;
      </>}
      {todo.completedOn && <>
        <span style={{ color: "gray" }}>{todo.completedOn.toLocaleDateString()}</span>
        &nbsp;
      </>}
      {todo.createdOn && <>
        <span style={{ color: "gray" }}>{todo.createdOn.toLocaleDateString()}</span>
        &nbsp;
      </>
      }
      <span>{todo.description}</span>
      {todo.contexts.length > 0 && <>
        &nbsp;
        <span style={{ color: "green" }}>@{todo.contexts.join(" @")}</span>
      </>}
      {todo.projects.length > 0 && <>
        &nbsp;
        <span style={{ color: "blue" }}>+{todo.projects.join(" +")}</span>
      </>}
      {Object.entries(todo.tags).map(([key, value]) => <>
        &nbsp;
        <span style={{ color: "yellowgreen" }}>{key}:{value}</span>
      </>)}
    </div>
  );
};

// this is the shell command that gets executed every time this widget refreshes
export const command = "cat $HOME/Dropbox/todotxt/todo.txt $HOME/Dropbox/todotxt/done.txt";

// the refresh frequency in milliseconds
export const refreshFrequency = 1000000;

// the CSS style for this widget, written using Emotion
// https://emotion.sh/
export const className = `
  bottom: 1em;
  left: 1em;
  width: 1024px;
  max-height: 256px;
  overflow: scroll;
  box-sizing: border-box;
  margin: auto;
  padding: 0 20px 20px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #141f33;
  font-family: Helvetica Neue;
  font-weight: 300;
  border: 2px solid #fff;
  border-radius: 1px;
  text-align: justify;
  line-height: 1.5;

  h1 {
    font-size: 20px;
    margin: 16px 0 8px;
  }

  em {
    font-weight: 400;
    font-style: normal;
  }
`;

// render gets called after the shell command has executed. The command's output
// is passed in as a string.
export const render = ({ output }: Props) => {
  const tasks = output.split("\n").
    filter(entry => entry.length > 0).
    map(parseTodo);

  return (
    <div>
      <h1>List</h1>
      {tasks.map((task, index) => <TodoView key={index} todo={task} />)}
    </div>
  );
};
