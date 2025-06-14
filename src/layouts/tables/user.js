import { useEffect, useState } from "react";
import {
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  Card,
  Avatar,
  CardMedia,
  Snackbar,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://business-branding.synoventum.site";

// Custom color palette
const colors = {
  primary: "#5e72e4",
  secondary: "#f7fafc",
  success: "#2dce89",
  info: "#11cdef",
  warning: "#fb6340",
  danger: "#f5365c",
  light: "#f8f9fa",
  dark: "#212529",
  white: "#ffffff",
  textPrimary: "#32325d",
  textSecondary: "#525f7f",
  gradientPrimary: "linear-gradient(87deg, #5e72e4 0, #825ee4 100%)",
  gradientSuccess: "linear-gradient(87deg, #2dce89 0, #2dcecc 100%)",
  gradientDanger: "linear-gradient(87deg, #f5365c 0, #f56036 100%)",
  gradientInfo: "linear-gradient(87deg, #11cdef 0, #1171ef 100%)",
};

function Users() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewUserData, setViewUserData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    mobile_number: "",
    email: "",
    profile_image: "",
    employeeid: "",
    password: "",
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    mobile_number: "",
    email: "",
    password: "",
    validation_key: "",
    profile_image: "",
    employeeid: "",
  });
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [statusData, setStatusData] = useState({
    id: null,
    status: "active",
    duration: "3 months", // Added duration field
  });
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 0,
    totalPages: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, [pagination.currentPage, pagination.rowsPerPage, statusFilter]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      let url = `${BASE_URL}/api/admin/users?page=${pagination.currentPage + 1}&limit=${
        pagination.rowsPerPage
      }`;

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data.users || []);
      setPagination({
        ...pagination,
        total: data.data.total,
        totalPages: data.data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      showSnackbar("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch(`${BASE_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showSnackbar("Error fetching employees", "error");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return null;
      }

      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch(`${BASE_URL}/api/upload/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      return data.files[0].filename;
    } catch (error) {
      console.error("Error uploading file:", error);
      showSnackbar(error.message || "Error uploading file", "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleViewUser = (user) => {
    setViewUserData(user);
    setOpenViewDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setEditData({
      id: user.id,
      mobile_number: user.mobile_number,
      email: user.email,
      profile_image: user.profile_image,
      employeeid: user.employeeid,
      password: "",
    });
    setOpenEditDialog(true);
  };

  const handleOpenStatusDialog = (user) => {
    setStatusData({
      id: user.id,
      status: user.status,
      duration: "3 months", // Default duration
    });
    setOpenStatusDialog(true);
  };

  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleUpdateUserStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/admin/users/${statusData.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusData.status,
          duration: statusData.duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const data = await response.json();
      showSnackbar(data.message || "User status updated successfully");
      setOpenStatusDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      showSnackbar(error.message || "Error updating user status", "error");
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const payload = {
        mobile_number: editData.mobile_number,
        email: editData.email,
        profile_image: editData.profile_image,
        employeeid: editData.employeeid,
      };

      if (editData.password) {
        payload.password = editData.password;
      }

      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      showSnackbar("User updated successfully");
      setOpenEditDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbar(error.message || "Error updating user", "error");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      showSnackbar("User deleted successfully");
      setOpenDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar(error.message || "Error deleting user", "error");
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      showSnackbar("User created successfully");
      setOpenCreateDialog(false);
      setNewUser({
        mobile_number: "",
        email: "",
        password: "",
        validation_key: "",
        profile_image: "",
        employeeid: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar(error.message || "Error creating user", "error");
    }
  };

  // Helper to render a Chip for user status
  function getStatusChip(status) {
    let color = "default";
    let label = status;
    switch (status) {
      case "active":
        color = "success";
        label = "Active";
        break;
      case "inactive":
        color = "danger";
        label = "Inactive";
        break;
      default:
        color = "default";
        label = status;
    }
    return (
      <Chip
        label={label}
        sx={{
          background: status === "active" ? colors.gradientSuccess : colors.gradientDanger,
          color: colors.white,
          fontWeight: "bold",
          fontSize: "0.7rem",
          height: "24px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    );
  }

  // Helper to render user image
  function renderUserImage(filename) {
    if (!filename) return <MDTypography variant="caption">No Image</MDTypography>;

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          src={`${BASE_URL}/uploads/${filename}`}
          variant="rounded"
          sx={{
            width: 80,
            height: 40,
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              cursor: "pointer",
            },
          }}
          onClick={() => window.open(`${BASE_URL}/uploads/${filename}`, "_blank")}
        />
      </Box>
    );
  }

  function ActionsColumnCell({ row, onView, onEdit, onStatus, onDelete }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    return (
      <>
        <IconButton
          aria-label="more"
          aria-controls="actions-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
          size="small"
          sx={{
            color: colors.primary,
            "&:hover": {
              backgroundColor: "rgba(94, 114, 228, 0.1)",
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            style: {
              minWidth: "160px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.05)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onView(row.original);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(17, 205, 239, 0.1)",
              },
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" sx={{ color: colors.info }} />
            </ListItemIcon>
            <ListItemText
              primary="View"
              primaryTypographyProps={{ color: colors.textPrimary, fontSize: "0.875rem" }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEdit(row.original);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(94, 114, 228, 0.1)",
              },
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Edit"
              primaryTypographyProps={{ color: colors.textPrimary, fontSize: "0.875rem" }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onStatus(row.original);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 193, 7, 0.1)",
              },
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: colors.warning }} />
            </ListItemIcon>
            <ListItemText
              primary="Status"
              primaryTypographyProps={{ color: colors.textPrimary, fontSize: "0.875rem" }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete(row.original.id);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(245, 54, 92, 0.1)",
              },
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: colors.danger }} />
            </ListItemIcon>
            <ListItemText
              primary="Delete"
              primaryTypographyProps={{ color: colors.textPrimary, fontSize: "0.875rem" }}
            />
          </MenuItem>
        </Menu>
      </>
    );
  }

  ActionsColumnCell.propTypes = {
    row: PropTypes.object.isRequired,
    onView: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onStatus: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  function IdCell({ value }) {
    return (
      <MDTypography variant="caption" color={colors.textPrimary} fontWeight="medium">
        {value}
      </MDTypography>
    );
  }
  IdCell.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  function NameCell({ value }) {
    return (
      <MDTypography variant="caption" color={colors.textPrimary} fontWeight="medium">
        {value}
      </MDTypography>
    );
  }
  NameCell.propTypes = {
    value: PropTypes.string.isRequired,
  };

  function DateCell({ value }) {
    return (
      <MDTypography variant="caption" color={colors.textPrimary}>
        {new Date(value).toLocaleDateString()}
      </MDTypography>
    );
  }
  DateCell.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  };

  function ImageCell({ value }) {
    return renderUserImage(value);
  }
  ImageCell.propTypes = {
    value: PropTypes.string,
  };

  function StatusCell({ value }) {
    return getStatusChip(value);
  }
  StatusCell.propTypes = {
    value: PropTypes.string.isRequired,
  };

  const columns = [
    {
      Header: "ID",
      accessor: "id",
      width: "5%",
      Cell: IdCell,
    },
    {
      Header: "Mobile",
      accessor: "mobile_number",
      width: "15%",
      Cell: NameCell,
    },
    {
      Header: "Email",
      accessor: "email",
      width: "20%",
      Cell: NameCell,
    },
    {
      Header: "Employee ID",
      accessor: "employeeid",
      width: "15%",
      Cell: NameCell,
    },
    {
      Header: "Image",
      accessor: "profile_image",
      Cell: ImageCell,
      width: "15%",
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: StatusCell,
      width: "10%",
    },
    {
      Header: "Created At",
      accessor: "created_at",
      Cell: DateCell,
      width: "15%",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: (cellProps) => (
        <ActionsColumnCell
          {...cellProps}
          onView={handleViewUser}
          onEdit={handleOpenEditDialog}
          onStatus={handleOpenStatusDialog}
          onDelete={handleOpenDeleteDialog}
        />
      ),
      width: "20%",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.mobile_number.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      (user.employeeid && user.employeeid.toLowerCase().includes(searchTermLower)) ||
      user.id.toString().includes(searchTermLower)
    );
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPagination({ ...pagination, currentPage: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({
      ...pagination,
      rowsPerPage: parseInt(event.target.value, 10),
      currentPage: 0,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: colors.primary,
              animationDuration: "800ms",
            }}
          />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: "12px",
                boxShadow: "0 0.25rem 0.75rem rgba(0, 0, 0, 0.05)",
                border: "none",
                overflow: "visible",
              }}
            >
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                borderRadius="lg"
                sx={{
                  background: colors.gradientPrimary,
                  boxShadow:
                    "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(94, 114, 228, 0.4)",
                }}
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <MDTypography
                    variant="h6"
                    color={colors.white}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Users Management
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <FormControl sx={{ minWidth: 120 }} size="small">
                      <InputLabel
                        sx={{
                          color: colors.white,
                          "&.Mui-focused": {
                            color: colors.white,
                          },
                        }}
                      >
                        Status
                      </InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                        sx={{
                          width: 150,
                          height: 36,
                          color: colors.white,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255,255,255,0.5)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255,255,255,0.75)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.white,
                          },
                          "& .MuiSvgIcon-root": {
                            color: colors.white,
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              borderRadius: "8px",
                              marginTop: "8px",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                            },
                          },
                        }}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search users..."
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          fetchUsers();
                        }
                      }}
                      sx={{
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                        "& .MuiInputBase-input": {
                          color: colors.white,
                          "&::placeholder": {
                            color: "rgba(255,255,255,0.7)",
                            opacity: 1,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.5)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.75)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.white,
                          },
                        },
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateDialog}
                      sx={{
                        background: colors.gradientSuccess,
                        "&:hover": {
                          background: "linear-gradient(87deg, #2dce89 0, #2dce89 100%)",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        },
                        height: 36,
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "6px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        padding: "8px 16px",
                        minWidth: "140px",
                      }}
                    >
                      New User
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Paper
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <DataTable
                    table={{
                      columns,
                      rows: filteredUsers.map((user) => ({
                        ...user,
                        created_at: new Date(user.created_at).toLocaleDateString(),
                      })),
                    }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                    sx={{
                      "& .MuiTableRow-root": {
                        transition: "background-color 0.2s ease",
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(0,0,0,0.02)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(94, 114, 228, 0.05)",
                        },
                      },
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                        padding: "12px 16px",
                      },
                      "& .MuiTableHead-root": {
                        "& .MuiTableCell-root": {
                          backgroundColor: colors.secondary,
                          color: colors.textPrimary,
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid rgba(0,0,0,0.05)",
                        },
                      },
                    }}
                  />
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={pagination.total}
                    rowsPerPage={pagination.rowsPerPage}
                    page={pagination.currentPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      borderTop: "1px solid rgba(0,0,0,0.05)",
                      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        color: colors.textSecondary,
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </Paper>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* User Details View Dialog */}
      {/* ... unchanged ... */}

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: colors.gradientInfo,
            color: colors.white,
            padding: "16px 24px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MDTypography variant="h5" color={colors.white}>
            Edit User
          </MDTypography>
          <IconButton
            onClick={() => setOpenEditDialog(false)}
            sx={{
              color: colors.white,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.secondary }}>
          <MDBox mt={3} mb={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mobile Number"
                  fullWidth
                  margin="normal"
                  value={editData.mobile_number}
                  onChange={(e) => setEditData({ ...editData, mobile_number: e.target.value })}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary,
                        boxShadow: `0 0 0 2px ${colors.primary}20`,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary,
                        boxShadow: `0 0 0 2px ${colors.primary}20`,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="New Password"
                  fullWidth
                  margin="normal"
                  type="password"
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary,
                        boxShadow: `0 0 0 2px ${colors.primary}20`,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Employee ID</InputLabel>
                  <Select
                    value={editData.employeeid}
                    onChange={(e) => setEditData({ ...editData, employeeid: e.target.value })}
                    label="Employee ID"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0,0,0,0.1)",
                        },
                        "&:hover fieldset": {
                          borderColor: colors.primary,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary,
                          boxShadow: `0 0 0 2px ${colors.primary}20`,
                        },
                      },
                    }}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.employeeid}>
                        {employee.employeeid}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MDBox mt={2} mb={1}>
                  <MDTypography
                    variant="caption"
                    color={colors.textSecondary}
                    fontWeight="bold"
                    display="block"
                    mb={1}
                  >
                    Profile Image
                  </MDTypography>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="edit-user-upload"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const filename = await handleFileUpload(file);
                        if (filename) {
                          setEditData({
                            ...editData,
                            profile_image: filename,
                          });
                        }
                      }
                    }}
                  />
                  <label htmlFor="edit-user-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        background: colors.gradientPrimary,
                        "&:hover": {
                          background: "linear-gradient(87deg, #5e72e4 0, #5e72e4 100%)",
                        },
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      Upload New Image
                    </Button>
                  </label>
                  {uploading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: colors.primary,
                        ml: 2,
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                </MDBox>
                {editData.profile_image && (
                  <Box mt={2}>
                    <Paper
                      elevation={0}
                      sx={{
                        display: "inline-block",
                        padding: "8px",
                        border: "1px dashed rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        backgroundColor: colors.white,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={`${BASE_URL}/uploads/${editData.profile_image}`}
                        sx={{
                          width: 200,
                          height: 100,
                          borderRadius: "6px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                        alt="User Preview"
                      />
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.secondary, padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              color: colors.textSecondary,
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "6px",
              border: "1px solid rgba(0,0,0,0.1)",
              padding: "8px 24px",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.02)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  showSnackbar("No token found, please login again", "error");
                  navigate("/authentication/sign-in");
                  return;
                }
                const payload = {
                  mobile_number: editData.mobile_number,
                  email: editData.email,
                  profile_image: editData.profile_image,
                  employeeid: editData.employeeid,
                };
                if (editData.password) {
                  payload.password = editData.password;
                }
                // Use correct endpoint for user update
                const response = await fetch(`${BASE_URL}/api/admin/users/${editData.id}`, {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                });
                if (!response.ok) {
                  throw new Error("Failed to update user");
                }
                showSnackbar("User updated successfully");
                setOpenEditDialog(false);
                fetchUsers();
              } catch (error) {
                console.error("Error updating user:", error);
                showSnackbar(error.message || "Error updating user", "error");
              }
            }}
            variant="contained"
            sx={{
              background: colors.gradientSuccess,
              "&:hover": {
                background: "linear-gradient(87deg, #2dce89 0, #2dce89 100%)",
              },
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              ml: 2,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      {/* ... unchanged ... */}

      {/* Delete Confirmation Dialog */}
      {/* ... unchanged ... */}

      {/* Create User Dialog */}
      {/* ... unchanged ... */}

      {/* Snackbar for notifications */}
      {/* ... unchanged ... */}

      <Footer />
    </DashboardLayout>
  );
}

export default Users;
