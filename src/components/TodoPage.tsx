/**
 * @todo YOU HAVE TO IMPLEMENT THE DELETE AND SAVE TASK ENDPOINT, A TASK CANNOT BE UPDATED IF THE TASK NAME DID NOT CHANGE, YOU'VE TO CONTROL THE BUTTON STATE ACCORDINGLY
 */
import {
  CalendarToday,
  Check,
  Delete,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import useFetch from "../hooks/useFetch.ts";
import { Task } from "../index";
import { StaticDatePicker } from "@mui/x-date-pickers";

dayjs.extend(relativeTime);
dayjs.locale("fr");

const TodoPage = () => {
  const api = useFetch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskName, setEditedTaskName] = useState<string>("");

  // const handleFetchTasks = async () => setTasks(await api.get('/tasks'));
  const handleFetchTasks = async () => {
    setTasks(await api.get("/tasks"));
    console.log("tasks", tasks);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/tasks/${id}`);
    handleFetchTasks();
  };

  const handleSave = async () => {
    const trimmedName = taskName.trim();
    if (trimmedName === "") return;

    const alreadyExists = tasks.some(
      (task) => task.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      alert("Cette tâche existe déjà.");
      return;
    }

    await api.post("/tasks", {
      name: trimmedName,
      isDone: false,
      deadline: selectedDate?.toISOString() || null,
    });

    setTaskName("");
    setShowCalendar(false);
    handleFetchTasks();
  };

  const handleUpdateTaskName = async (task: Task) => {
    const trimmedName = editedTaskName.trim();

    if (trimmedName === "" || trimmedName === task.name) {
      setEditingTaskId(null);
      return;
    }

    await api.patch(`/tasks/${task.id}`, {
      id: task.id,
      name: trimmedName,
      isDone: task.isDone,
      deadline: task.deadline,
    });

    setEditingTaskId(null);
    handleFetchTasks();
  };

  const endTask = async (task: Task) => {
    await api.patch(`/tasks/${task.id}`, {
      id: task.id,
      name: task.name,
      isDone: !task.isDone,
    });
    handleFetchTasks();
  };

  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };
  useEffect(() => {
    (async () => {
      handleFetchTasks();
    })();
  }, []);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        py: 4,
        px: 2,
      }}
    >
      <Box display="flex" flexDirection="column" gap={2} width="100%">
        <Box display="flex" justifyContent="center">
          <Typography variant="h5">HDM Todo List</Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt={2}
          gap={1}
          width="100%"
        >
          <TextField
            id="outlined-basic"
            size="small"
            fontSize="12px"
            variant="outlined"
            placeholder="Nouvelle tache"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            fullWidth
          />
          <Box>
            <IconButton
              onClick={toggleCalendar}
              sx={{ border: "1px solid #ccc", borderRadius: "8px", p: 1 }}
              title="Choisir une deadline"
            >
              <CalendarTodayIcon sx={{ width: "20px" }} />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            onClick={() => handleSave()}
            sx={{ backgroundColor: "#000000", borderRadius: "4px" }}
          >
            <AddIcon sx={{ color: "#fff" }} />
          </Button>
        </Box>
        {showCalendar && (
          <Box mt={2} sx={{ border: "1px solid #ccc", borderRadius: "8px" }}>
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fontSize: "12px",
                },
              }}
            />
          </Box>
        )}

        <Box justifyContent="center" mt={1} flexDirection="column">
          <Box justifyContent="center" mt={1} flexDirection="column">
            {tasks.map((task, id) => {
              const isOverdue =
                task.deadline && dayjs(task.deadline).isBefore(dayjs(), "day");
              const isDueTomorrow =
                task.deadline &&
                dayjs(task.deadline).isSame(dayjs().add(1, "day"), "day");

              const isEditing = editingTaskId === task.id;

              return (
                <Box
                  key={"Task " + id}
                  mt={2}
                  width="100%"
                  border="1px solid #ccc"
                  borderRadius="4px"
                  sx={{
                    padding: "8px",
                    backgroundColor: isOverdue ? "#fff5f5" : "white",
                    borderColor: isOverdue ? "#f44336" : "#ccc",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox
                        size="small"
                        onChange={() => endTask(task)}
                        checked={task.isDone}
                      />
                      {isEditing ? (
                        <TextField
                          value={editedTaskName}
                          onChange={(e) => setEditedTaskName(e.target.value)}
                          size="small"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateTaskName(task);
                          }}
                          autoFocus
                          sx={{
                            width: "200px",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            textDecoration: task.isDone
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {task.name}
                        </span>
                      )}
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        onClick={() => {
                          if (isEditing) {
                            handleUpdateTaskName(task);
                          } else {
                            setEditingTaskId(task.id);
                            setEditedTaskName(task.name);
                          }
                        }}
                      >
                        {isEditing ? (
                          <CheckIcon sx={{ color: "#4caf50", width: "20px" }} />
                        ) : (
                          <EditOutlinedIcon
                            sx={{ color: "#1976d2", width: "20px" }}
                          />
                        )}
                      </IconButton>

                      <IconButton
                        onClick={() => handleDelete(task.id)}
                        sx={{ background: "none" }}
                      >
                        <DeleteOutlineOutlined
                          sx={{ color: "red", width: "20px" }}
                        />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      padding: "0 18px",
                      fontSize: "12px",
                      color: "#888",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ScheduleIcon sx={{ width: "12px" }} />
                      Créée {dayjs(task.createdAt).fromNow()}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: isOverdue
                          ? "#f44336"
                          : isDueTomorrow
                          ? "#ff9800"
                          : "#888",
                      }}
                    >
                      <CalendarTodayIcon sx={{ width: "12px" }} />
                      {task.deadline
                        ? isOverdue
                          ? "Échéance : En retard"
                          : isDueTomorrow
                          ? "Échéance : Demain"
                          : `Échéance : ${dayjs(task.deadline).format(
                              "D MMMM"
                            )}`
                        : "Pas de deadline"}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TodoPage;
