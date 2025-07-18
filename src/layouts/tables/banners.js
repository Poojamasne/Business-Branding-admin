import { useEffect, useState } from "react";
import {
  IconButton,
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
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import PropTypes from "prop-types";

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

// Custom color palette with vibrant yet professional colors
const colors = {
  primary: "#5e72e4", // Vibrant blue
  secondary: "#f7fafc", // Light gray background
  success: "#2dce89", // Fresh green
  info: "#11cdef", // Bright cyan
  warning: "#fb6340", // Orange
  danger: "#f5365c", // Pinkish red
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

function Banners() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewBannerData, setViewBannerData] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    banner_name: "",
    banner_title: "",
    image: "",
    type: "home",
    status: "active",
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newBanner, setNewBanner] = useState({
    banner_name: "",
    banner_title: "",
    image: "",
    type: "home",
    status: "active",
  });
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBanners();
  }, [statusFilter, typeFilter]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      let url = `${BASE_URL}/api/banner`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      setBanners(data.data || []);
    } catch (error) {
      console.error("Error fetching banner data:", error);
      showSnackbar("Error fetching banners", "error");
    } finally {
      setLoading(false);
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

  const handleViewBanner = (banner) => {
    setViewBannerData(banner);
    setOpenViewDialog(true);
  };

  const handleOpenEditDialog = (banner) => {
    setEditData({
      id: banner.id,
      banner_name: banner.banner_name,
      banner_title: banner.banner_title,
      image: banner.image,
      type: banner.type,
      status: banner.status,
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleUpdateBanner = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/banner/${editData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update banner");
      }

      showSnackbar("Banner updated successfully");
      setOpenEditDialog(false);
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      showSnackbar(error.message || "Error updating banner", "error");
    }
  };

  const handleDeleteBanner = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        m;
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/banner/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete banner");
      }

      showSnackbar("Banner deleted successfully");
      setOpenDeleteDialog(false);
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      showSnackbar(error.message || "Error deleting banner", "error");
    }
  };

  const handleCreateBanner = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBanner),
      });

      if (!response.ok) {
        throw new Error("Failed to create banner");
      }

      showSnackbar("Banner created successfully");
      setOpenCreateDialog(false);
      setNewBanner({
        banner_name: "",
        banner_title: "",
        image: "",
        type: "home",
        status: "active",
      });
      fetchBanners();
    } catch (error) {
      console.error("Error creating banner:", error);
      showSnackbar(error.message || "Error creating banner", "error");
    }
  };

  // Helper to render a Chip for banner type
  function getTypeChip(type) {
    let color = "default";
    let label = type;
    switch (type) {
      case "home":
        color = "primary";
        label = "Home";
        break;
      case "promo":
        color = "success";
        label = "Promo";
        break;
      case "category":
        color = "info";
        label = "Category";
        break;
      case "bottom":
        color = "warning";
        label = "Bottom";
        break;
      default:
        color = "default";
        label = type;
    }
    return (
      <Chip
        label={label}
        sx={{
          background: colors.gradientPrimary,
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

  // Helper to render a Chip for banner status
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

  // Helper to render banner image
  function renderBannerImage(filename) {
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

  function ActionsColumnCell({ row, onView, onEdit, onDelete }) {
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

  function TitleCell({ value }) {
    return (
      <MDTypography variant="caption" color={value ? colors.textPrimary : colors.textSecondary}>
        {value || "N/A"}
      </MDTypography>
    );
  }
  TitleCell.propTypes = {
    value: PropTypes.string,
  };

  function ImageCell({ value }) {
    return renderBannerImage(value);
  }
  ImageCell.propTypes = {
    value: PropTypes.string,
  };

  function TypeCell({ value }) {
    return getTypeChip(value);
  }
  TypeCell.propTypes = {
    value: PropTypes.string.isRequired,
  };

  function StatusCell({ value }) {
    return getStatusChip(value);
  }
  StatusCell.propTypes = {
    value: PropTypes.string.isRequired,
  };

  function CreatedAtCell({ value }) {
    return (
      <MDTypography variant="caption" color={colors.textSecondary}>
        {new Date(value).toLocaleDateString()}
      </MDTypography>
    );
  }
  CreatedAtCell.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  };

  const columns = [
    {
      Header: "ID",
      accessor: "id",
      width: "5%",
      Cell: IdCell,
    },
    {
      Header: "Name",
      accessor: "banner_name",
      width: "15%",
      Cell: NameCell,
    },
    {
      Header: "Title",
      accessor: "banner_title",
      width: "20%",
      Cell: TitleCell,
    },
    {
      Header: "Image",
      accessor: "image",
      Cell: ImageCell,
      width: "15%",
    },
    {
      Header: "Type",
      accessor: "type",
      Cell: TypeCell,
      width: "10%",
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
      Cell: CreatedAtCell,
      width: "15%",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: (cellProps) => (
        <ActionsColumnCell
          {...cellProps}
          onView={handleViewBanner}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      ),
      width: "10%",
    },
  ];

  const filteredBanners = banners.filter((banner) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      banner.banner_name.toLowerCase().includes(searchTermLower) ||
      (banner.banner_title && banner.banner_title.toLowerCase().includes(searchTermLower)) ||
      banner.id.toString().includes(searchTermLower)
    );
  });

  // Apply pagination
  const paginatedBanners = filteredBanners.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
                    Banners Management
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
                    <FormControl sx={{ minWidth: 120 }} size="small">
                      <InputLabel
                        sx={{
                          color: colors.white,
                          "&.Mui-focused": {
                            color: colors.white,
                          },
                        }}
                      >
                        Type
                      </InputLabel>
                      <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        label="Type"
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
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="home">Home</MenuItem>
                        <MenuItem value="promo">Promo</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="bottom">Bottom</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search banners..."
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                      New Banner
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
                      rows: paginatedBanners.map((banner) => ({
                        ...banner,
                        created_at: new Date(banner.created_at).toLocaleDateString(),
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
                    count={filteredBanners.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
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

      {/* Banner Details View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: colors.gradientPrimary,
            color: colors.white,
            padding: "16px 24px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MDTypography variant="h5" color={colors.white}>
            Banner Details
          </MDTypography>
          <IconButton
            onClick={() => setOpenViewDialog(false)}
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
        <DialogContent dividers sx={{ backgroundColor: colors.secondary }}>
          {viewBannerData && (
            <MDBox>
              <MDBox mb={3}>
                <MDTypography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    color: colors.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                  Banner Information
                </MDTypography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={3} mt={1}>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        ID
                      </MDTypography>
                      <MDTypography variant="body2" color={colors.textPrimary}>
                        {viewBannerData.id}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        Name
                      </MDTypography>
                      <MDTypography variant="body2" color={colors.textPrimary}>
                        {viewBannerData.banner_name}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        Title
                      </MDTypography>
                      <MDTypography variant="body2" color={colors.textPrimary}>
                        {viewBannerData.banner_title || "N/A"}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        Image Preview
                      </MDTypography>
                      <Box
                        display="flex"
                        justifyContent="center"
                        my={2}
                        sx={{
                          border: "1px dashed rgba(0,0,0,0.1)",
                          borderRadius: "8px",
                          padding: "16px",
                          backgroundColor: colors.white,
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={`${BASE_URL}/uploads/${viewBannerData.image}`}
                          sx={{
                            width: "100%",
                            maxWidth: 400,
                            height: "auto",
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          }}
                          alt="Banner Image"
                        />
                      </Box>
                      <Box display="flex" justifyContent="center" mt={2}>
                        <IconButton
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = `${BASE_URL}/uploads/${viewBannerData.image}`;
                            link.download = viewBannerData.image;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          sx={{
                            background: colors.gradientSuccess,
                            color: colors.white,
                            "&:hover": {
                              background: "linear-gradient(87deg, #2dce89 0, #2dce89 100%)",
                            },
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        Type
                      </MDTypography>
                      {getTypeChip(viewBannerData.type)}
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        Status
                      </MDTypography>
                      {getStatusChip(viewBannerData.status)}
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDBox mb={2}>
                      <MDTypography
                        variant="caption"
                        color={colors.textSecondary}
                        fontWeight="bold"
                        display="block"
                        mb={0.5}
                      >
                        Created At
                      </MDTypography>
                      <MDTypography variant="body2" color={colors.textPrimary}>
                        {new Date(viewBannerData.created_at).toLocaleDateString()}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.secondary, padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenViewDialog(false)}
            variant="contained"
            sx={{
              background: colors.gradientDanger,
              "&:hover": {
                background: "linear-gradient(87deg, #f5365c 0, #f5365c 100%)",
              },
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Banner Dialog */}
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
            Edit Banner
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
                  label="Banner Name"
                  fullWidth
                  margin="normal"
                  value={editData.banner_name}
                  onChange={(e) => setEditData({ ...editData, banner_name: e.target.value })}
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
                  label="Banner Title"
                  fullWidth
                  margin="normal"
                  value={editData.banner_title}
                  onChange={(e) => setEditData({ ...editData, banner_title: e.target.value })}
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
              <Grid item xs={12}>
                <MDBox mt={2} mb={1}>
                  <MDTypography
                    variant="caption"
                    color={colors.textSecondary}
                    fontWeight="bold"
                    display="block"
                    mb={1}
                  >
                    Banner Image
                  </MDTypography>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="edit-banner-upload"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const filename = await handleFileUpload(file);
                        if (filename) {
                          setEditData({
                            ...editData,
                            image: filename,
                          });
                        }
                      }
                    }}
                  />
                  <label htmlFor="edit-banner-upload">
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
                {editData.image && (
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
                        image={`${BASE_URL}/uploads/${editData.image}`}
                        sx={{
                          width: 200,
                          height: 100,
                          borderRadius: "6px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                        alt="Banner Preview"
                      />
                    </Paper>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    label="Type"
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
                    <MenuItem value="home">Home</MenuItem>
                    <MenuItem value="promo">Promo</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="bottom">Bottom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    label="Status"
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
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
            onClick={handleUpdateBanner}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
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
            background: colors.gradientDanger,
            color: colors.white,
            padding: "16px 24px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MDTypography variant="h5" color={colors.white}>
            Confirm Delete
          </MDTypography>
          <IconButton
            onClick={() => setOpenDeleteDialog(false)}
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
            <MDTypography
              variant="body1"
              color={colors.textPrimary}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <DeleteIcon color="error" />
              Are you sure you want to delete this banner? This action cannot be undone.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.secondary, padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
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
            onClick={handleDeleteBanner}
            variant="contained"
            sx={{
              background: colors.gradientDanger,
              "&:hover": {
                background: "linear-gradient(87deg, #f5365c 0, #f5365c 100%)",
              },
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              ml: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: colors.gradientSuccess,
            color: colors.white,
            padding: "16px 24px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MDTypography variant="h5" color={colors.white}>
            Create New Banner
          </MDTypography>
          <IconButton
            onClick={() => setOpenCreateDialog(false)}
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
        <DialogContent dividers sx={{ backgroundColor: colors.secondary }}>
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Banner Name"
                  fullWidth
                  margin="normal"
                  value={newBanner.banner_name}
                  onChange={(e) => setNewBanner({ ...newBanner, banner_name: e.target.value })}
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
                  label="Banner Title"
                  fullWidth
                  margin="normal"
                  value={newBanner.banner_title}
                  onChange={(e) => setNewBanner({ ...newBanner, banner_title: e.target.value })}
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
              <Grid item xs={12}>
                <MDBox mt={2} mb={1}>
                  <MDTypography
                    variant="caption"
                    color={colors.textSecondary}
                    fontWeight="bold"
                    display="block"
                    mb={1}
                  >
                    Banner Image
                  </MDTypography>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="create-banner-upload"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const filename = await handleFileUpload(file);
                        if (filename) {
                          setNewBanner({
                            ...newBanner,
                            image: filename,
                          });
                        }
                      }
                    }}
                  />
                  <label htmlFor="create-banner-upload">
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
                      Upload Image
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
                {newBanner.image && (
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
                        image={`${BASE_URL}/uploads/${newBanner.image}`}
                        sx={{
                          width: 200,
                          height: 100,
                          borderRadius: "6px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                        alt="Banner Preview"
                      />
                    </Paper>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newBanner.type}
                    onChange={(e) => setNewBanner({ ...newBanner, type: e.target.value })}
                    label="Type"
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
                    <MenuItem value="home">Home</MenuItem>
                    <MenuItem value="promo">Promo</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="bottom">Bottom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newBanner.status}
                    onChange={(e) => setNewBanner({ ...newBanner, status: e.target.value })}
                    label="Status"
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.secondary, padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
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
            onClick={handleCreateBanner}
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
            Create Banner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <DeleteIcon fontSize="inherit" />,
            warning: <DeleteIcon fontSize="inherit" />,
            info: <DeleteIcon fontSize="inherit" />,
          }}
        >
          <MDTypography variant="body2" fontWeight="medium">
            {snackbar.message}
          </MDTypography>
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}
export default Banners;
