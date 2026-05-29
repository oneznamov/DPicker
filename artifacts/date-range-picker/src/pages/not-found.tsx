import { Box, Paper, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <ErrorOutlineIcon sx={{ color: "error.main", fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            404 — Page Not Found
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          The page you are looking for doesn't exist.
        </Typography>
      </Paper>
    </Box>
  );
}
