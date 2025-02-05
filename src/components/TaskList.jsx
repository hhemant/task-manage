import React, { useEffect, useReducer } from "react";
import styles from "./TaskList.module.css";
import Task from "./Task";

const initialState = {
  status: "sleep",
  query: "",
  priority: "",
  dueDate: "",
  progress: 0,
  tasks: [],
};

const reducer = function (state, action) {
  switch (action.type) {
    case "fetching":
      return { ...state, status: "loading" };
    case "dataLoaded":
      return { ...state, status: "loaded", tasks: action.payload };
    case "updatePriority":
      return { ...state, priority: action.payload };
    case "updateDueDate":
      return { ...state, dueDate: action.payload };
    case "addingTask":
      return { ...state, status: "addingTask", query: action.payload };
    case "taskAdded":
      const newTask = {
        title: state.query,
        priority: state.priority,
        dueDate: state.dueDate,
      };

      if (!state.query.length) {
        console.warn("Task title is empty. Aborting task creation.");
        return state;
      }

      const updatedState = {
        ...state,
        status: "taskAdded",
        tasks: [...state.tasks, newTask],
        query: "",
        priority: "",
        dueDate: "",
      };

      fetch("https://tasks-api-0xkn.onrender.com/api/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      })
        .then((res) => {
          console.log("Response status:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Task added to the database:", data);
          // Reload the window after task is added
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error adding task to the database:", error);
        });

      return updatedState;
    case "taskCompleted":
      return {
        ...state,
        status: "taskCompleted",
        progress: state.progress + action.payload,
        priority: "",
        dueDate: "",
      };
    case "taskDeleted":
      return {
        ...state,
        status: "taskDeleted",
        tasks: state.tasks.filter((task) => task._id !== action.payload),
      };
    default:
      return "Action not defined";
  }
};

function TaskList() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    function () {
      fetch("https://tasks-api-0xkn.onrender.com/api/v1/tasks")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) =>
          dispatch({ type: "dataLoaded", payload: data.data.tasks })
        )
        .catch((error) => console.error("Fetch error:", error));
    },
    [state.tasks.length]
  );

  return (
    <>
      <span className={styles.heading}>Tasks.io</span>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className={styles.taskList}>
          {state.tasks.map((task) => (
            <Task task={task} key={task._id} dispatch={dispatch} />
          ))}
        </div>

        <p className={styles.progress}>
          {state.tasks.length > 0
            ? state.tasks.length !== state.progress
              ? `Done- ${state.progress} / ${state.tasks.length}`
              : `All tasks completed, add new 🥳`
            : "No tasks to show, add new 💼"}
        </p>

        <div className={`${styles.query__box} flex md:!w-[48%] !w-[96%]`}>
          <input
            type="text"
            value={state.query}
            placeholder="Enter task name"
            className={`${styles.query} text-stone-700`}
            onChange={(e) =>
              dispatch({ type: "addingTask", payload: e.target.value })
            }
          />

          <div className="absolute right-[40%] p-[0.7rem] border-l-[1px] border-stone-900 md:block hidden ">
            <select
              value={state.priority}
              className="focus:border-none active:border-none"
              onChange={(e) =>
                dispatch({ type: "updatePriority", payload: e.target.value })
              }
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="absolute right-[16%] p-[0.7rem] border-l-[1px] border-stone-900 ">
            <input
              type="date"
              value={state.dueDate}
              onChange={(e) =>
                dispatch({ type: "updateDueDate", payload: e.target.value })
              }
            />
          </div>

          <button
            className={`${styles.button} hidden md:block`}
            onClick={() => {
              dispatch({ type: "taskAdded", payload: state.query });
            }}
          >
            Add task
          </button>

          <button
            className={`${styles.button} block md:hidden`}
            onClick={() => {
              dispatch({ type: "taskAdded", payload: state.query });
            }}
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

export default TaskList;
