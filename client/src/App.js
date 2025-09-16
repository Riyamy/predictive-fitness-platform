import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
);

function App() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    workout: "run",
    nutrition: "balanced",
    sleep: "",
    performance: "",
    date: "",
    duration_minutes: "",
    calories_intake: ""
  });
  const [prediction, setPrediction] = useState(null);

  const fetchActivities = () => {
    fetch("http://localhost:5000/api/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error:", err));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then((res) => res.json())
      .then(() => {
        fetchActivities();
        setForm({
          workout: "run",
          nutrition: "balanced",
          sleep: "",
          performance: "",
          date: "",
          duration_minutes: "",
          calories_intake: ""
        });
        setPrediction(null);
      });
  };

  // 🔮 ML Prediction
  const handlePredict = () => {
    fetch("http://localhost:5001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workout_type: form.workout,
        duration_minutes: Number(form.duration_minutes) || 30,
        calories_intake: Number(form.calories_intake) || 2000,
        sleep_hours: Number(form.sleep) || 7
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Prediction response:", data);
        setPrediction(data.predicted_performance);

        // ⬇️ Auto-fill performance field with prediction
        setForm((prev) => ({
          ...prev,
          performance: data.predicted_performance.toFixed(2)
        }));
      })
      .catch((err) => console.error("Prediction error:", err));
  };

  // 📊 Summary Analytics
  const avgSleep =
    activities.length > 0
      ? (
          activities.reduce((sum, a) => sum + (a.sleep || 0), 0) /
          activities.length
        ).toFixed(1)
      : 0;

  const avgCalories =
    activities.length > 0
      ? (
          activities.reduce((sum, a) => sum + (a.calories_intake || 0), 0) /
          activities.length
        ).toFixed(0)
      : 0;

  const workoutPerf = {};
  activities.forEach((a) => {
    if (a.workout && a.performance) {
      if (!workoutPerf[a.workout]) workoutPerf[a.workout] = [];
      workoutPerf[a.workout].push(a.performance);
    }
  });
  let bestWorkout = "N/A";
  let bestScore = -Infinity;
  for (let w in workoutPerf) {
    const avg =
      workoutPerf[w].reduce((s, p) => s + p, 0) / workoutPerf[w].length;
    if (avg > bestScore) {
      bestScore = avg;
      bestWorkout = w;
    }
  }

  // Chart data
  const lineData = {
    labels: activities.map((a) =>
      new Date(a.date).toLocaleDateString("en-IN")
    ),
    datasets: [
      {
        label: "Performance",
        data: activities.map((a) => a.performance || 0),
        borderColor: "blue",
        fill: false
      }
    ]
  };

  const workoutCounts = activities.reduce((acc, a) => {
    acc[a.workout || "N/A"] = (acc[a.workout || "N/A"] || 0) + 1;
    return acc;
  }, {});
  const barData = {
    labels: Object.keys(workoutCounts),
    datasets: [
      {
        label: "Workout Frequency",
        data: Object.values(workoutCounts),
        backgroundColor: "green"
      }
    ]
  };

  return (
    <Container style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        🏋️ Predictive Fitness Analytics Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} style={{ marginBottom: "20px" }}>
        <Grid item xs={12} md={4}>
          <Card style={{ background: "#e3f2fd" }}>
            <CardContent>
              <Typography variant="h6">💤 Avg Sleep</Typography>
              <Typography variant="h5">{avgSleep} hrs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card style={{ background: "#fff3e0" }}>
            <CardContent>
              <Typography variant="h6">🔥 Avg Calories</Typography>
              <Typography variant="h5">{avgCalories}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card style={{ background: "#e8f5e9" }}>
            <CardContent>
              <Typography variant="h6">🏆 Best Workout</Typography>
              <Typography variant="h5">{bestWorkout}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Form */}
      <Card style={{ marginBottom: "20px" }}>
        <CardContent>
          <Typography variant="h6">➕ Log Activity</Typography>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
          >
            <TextField
              select
              label="Workout"
              name="workout"
              value={form.workout}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="run">Run</MenuItem>
              <MenuItem value="strength">Strength</MenuItem>
              <MenuItem value="cycle">Cycle</MenuItem>
              <MenuItem value="hiit">HIIT</MenuItem>
              <MenuItem value="yoga">Yoga</MenuItem>
            </TextField>
            <TextField
              label="Nutrition"
              name="nutrition"
              value={form.nutrition}
              onChange={handleChange}
              size="small"
            />
            <TextField
              label="Sleep (hrs)"
              name="sleep"
              value={form.sleep}
              onChange={handleChange}
              size="small"
              type="number"
            />
            <TextField
              label="Performance"
              name="performance"
              value={form.performance}
              onChange={handleChange}
              size="small"
              type="number"
              InputProps={{
                style: prediction ? { border: "2px solid #4caf50" } : {}
              }}
              helperText={prediction ? "Auto-filled from prediction ✅" : ""}
            />
            <TextField
              label="Duration (mins)"
              name="duration_minutes"
              value={form.duration_minutes}
              onChange={handleChange}
              size="small"
              type="number"
            />
            <TextField
              label="Calories"
              name="calories_intake"
              value={form.calories_intake}
              onChange={handleChange}
              size="small"
              type="number"
            />
            <TextField
              label="Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <Button type="submit" variant="contained" color="primary">
              Add Activity
            </Button>
          </form>
          <Button
            onClick={handlePredict}
            variant="outlined"
            color="secondary"
            style={{ marginTop: "10px" }}
          >
            🔮 Predict Performance
          </Button>
          {prediction && (
            <Typography variant="body1" style={{ marginTop: "10px" }}>
              ✅ Predicted Performance:{" "}
              <strong>{prediction.toFixed(2)}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">📈 Performance Over Time</Typography>
              <Line data={lineData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">💪 Workout Frequency</Typography>
              <Bar data={barData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Table */}
      <Card style={{ marginTop: "20px" }}>
        <CardContent>
          <Typography variant="h6">📋 All Activities</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Workout</TableCell>
                <TableCell>Sleep (hrs)</TableCell>
                <TableCell>Duration (mins)</TableCell>
                <TableCell>Calories</TableCell>
                <TableCell>Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>
                    {new Date(a.date).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>{a.workout}</TableCell>
                  <TableCell>{a.sleep}</TableCell>
                  <TableCell>{a.duration_minutes}</TableCell>
                  <TableCell>{a.calories_intake}</TableCell>
                  <TableCell>{a.performance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
