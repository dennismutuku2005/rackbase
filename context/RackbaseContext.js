"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  initialUser,
  initialRouters,
  initialAccessPoints,
  initialOtherEquipment,
  initialIncidents,
  initialMaintenance,
  initialActivityLogs,
  initialEquipmentModels,
} from "@/lib/mockData";

const RackbaseContext = createContext(null);

export function RackbaseProvider({ children }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(initialUser);

  // Entities
  const [routers, setRouters] = useState([]);
  const [accessPoints, setAccessPoints] = useState([]);
  const [otherEquipment, setOtherEquipment] = useState([]);
  const [equipmentModels, setEquipmentModels] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // UI States
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const auth = localStorage.getItem("rackbase_auth");
      setIsAuthenticated(auth === "true");

      const savedUser = localStorage.getItem("rackbase_user");
      if (savedUser) setUser(JSON.parse(savedUser));
      else localStorage.setItem("rackbase_user", JSON.stringify(initialUser));

      const savedRouters = localStorage.getItem("rackbase_routers");
      if (savedRouters) setRouters(JSON.parse(savedRouters));
      else {
        setRouters(initialRouters);
        localStorage.setItem("rackbase_routers", JSON.stringify(initialRouters));
      }

      const savedAps = localStorage.getItem("rackbase_aps");
      if (savedAps) setAccessPoints(JSON.parse(savedAps));
      else {
        setAccessPoints(initialAccessPoints);
        localStorage.setItem("rackbase_aps", JSON.stringify(initialAccessPoints));
      }

      const savedOther = localStorage.getItem("rackbase_other_eq");
      if (savedOther) setOtherEquipment(JSON.parse(savedOther));
      else {
        setOtherEquipment(initialOtherEquipment);
        localStorage.setItem("rackbase_other_eq", JSON.stringify(initialOtherEquipment));
      }

      const savedIncidents = localStorage.getItem("rackbase_incidents");
      if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
      else {
        setIncidents(initialIncidents);
        localStorage.setItem("rackbase_incidents", JSON.stringify(initialIncidents));
      }

      const savedMaint = localStorage.getItem("rackbase_maintenance");
      if (savedMaint) setMaintenance(JSON.parse(savedMaint));
      else {
        setMaintenance(initialMaintenance);
        localStorage.setItem("rackbase_maintenance", JSON.stringify(initialMaintenance));
      }

      const savedLogs = localStorage.getItem("rackbase_activity_logs");
      if (savedLogs) setActivityLogs(JSON.parse(savedLogs));
      else {
        setActivityLogs(initialActivityLogs);
        localStorage.setItem("rackbase_activity_logs", JSON.stringify(initialActivityLogs));
      }

      const savedModels = localStorage.getItem("rackbase_equipment_models");
      if (savedModels) setEquipmentModels(JSON.parse(savedModels));
      else {
        setEquipmentModels(initialEquipmentModels);
        localStorage.setItem("rackbase_equipment_models", JSON.stringify(initialEquipmentModels));
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }
  }, []);

  // Save changes to localStorage
  const saveState = (key, data, setter) => {
    setter(data);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error(`Failed to save ${key}`, err);
      }
    }
  };

  // Toast Helper
  const addToast = (message, type = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger Helper
  const logActivity = (action, description, targetId = "", targetType = "") => {
    const now = new Date();
    const formatted = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;
    const newLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: formatted,
      action,
      description,
      user: user.name || "Dennis Mutuku",
      targetId,
      targetType,
    };
    const updated = [newLog, ...activityLogs];
    saveState("rackbase_activity_logs", updated, setActivityLogs);
  };

  // Auth Functions
  const login = (email, password) => {
    if (!email || !password) {
      addToast("Please provide both email and password", "error");
      return false;
    }
    localStorage.setItem("rackbase_auth", "true");
    setIsAuthenticated(true);
    addToast(`Welcome back, ${user.name}`);
    router.push("/dashboard/home");
    return true;
  };

  const logout = () => {
    localStorage.removeItem("rackbase_auth");
    setIsAuthenticated(false);
    addToast("Logged out successfully", "info");
    router.push("/login");
  };

  // Hardware Model Catalog
  const addEquipmentModel = ({ name, type = "Router", category = "" }) => {
    if (!name || !name.trim()) return null;
    const trimmed = name.trim();
    const exists = equipmentModels.find(
      (m) => m.name.toLowerCase() === trimmed.toLowerCase() && m.type === type
    );
    if (exists) return exists;

    const id = `MDL-${Date.now().toString().slice(-4)}`;
    const newModel = {
      id,
      name: trimmed,
      type,
      category: category || (type === "Router" ? "Core / Edge Router" : "Sector / CPE"),
      isCustom: true,
    };
    const updated = [...equipmentModels, newModel];
    saveState("rackbase_equipment_models", updated, setEquipmentModels);
    addToast(`Model '${trimmed}' added to catalog`);
    return newModel;
  };

  // Router CRUD
  const addRouter = (data) => {
    const id = `RTR-00${routers.length + 1}`;
    const { serialNumber, ...cleanData } = data;
    const newRouter = {
      id,
      ...cleanData,
      apiPort: cleanData.apiPort ? Number(cleanData.apiPort) : 8728,
      winboxPort: cleanData.winboxPort ? Number(cleanData.winboxPort) : 8291,
      username: cleanData.username || "admin",
      password: cleanData.password || "",
      installationDate: cleanData.installationDate || new Date().toISOString().split("T")[0],
      status: cleanData.status || "Online",
      routerOsVersion: cleanData.routerOsVersion || "v7.14.2",
      cpuLoad: Math.floor(Math.random() * 25) + 15,
      uptime: "0d 01h 00m",
    };
    const updated = [newRouter, ...routers];
    saveState("rackbase_routers", updated, setRouters);
    logActivity("Router Registered", `Registered new MikroTik Router '${newRouter.name}' (${newRouter.model}) with IP ${newRouter.ipAddress}.`, id, "Router");
    addToast(`Router '${newRouter.name}' registered successfully`);
    return newRouter;
  };

  const updateRouter = (id, data) => {
    const { serialNumber, ...cleanData } = data;
    const updated = routers.map((r) => (r.id === id ? { ...r, ...cleanData } : r));
    saveState("rackbase_routers", updated, setRouters);
    logActivity("Equipment Updated", `Updated router settings for '${data.name || id}'.`, id, "Router");
    addToast(`Router updated successfully`);
  };

  const deleteRouter = (id) => {
    const routerToDelete = routers.find((r) => r.id === id);
    const affectedAps = accessPoints.filter((ap) => ap.parentRouterId === id);

    // Filter out router
    const updatedRouters = routers.filter((r) => r.id !== id);
    saveState("rackbase_routers", updatedRouters, setRouters);

    // If there were APs, mark them unlinked or assign to another router if available
    if (affectedAps.length > 0) {
      const fallbackRouter = updatedRouters[0];
      const updatedAps = accessPoints.map((ap) =>
        ap.parentRouterId === id ? { ...ap, parentRouterId: fallbackRouter ? fallbackRouter.id : "" } : ap
      );
      saveState("rackbase_aps", updatedAps, setAccessPoints);
    }

    logActivity("Equipment Deleted", `Deleted main router '${routerToDelete?.name || id}'.`, id, "Router");
    addToast(`Router '${routerToDelete?.name || id}' deleted`, "info");
  };

  // Access Point CRUD
  const addAccessPoint = (data) => {
    const id = `AP-0${accessPoints.length + 1 < 10 ? "0" : ""}${accessPoints.length + 1}`;
    const parent = routers.find((r) => r.id === data.parentRouterId);
    const { serialNumber, managementIp, ...cleanData } = data;
    const newAp = {
      id,
      ...cleanData,
      installationDate: cleanData.installationDate || new Date().toISOString().split("T")[0],
      status: cleanData.status || "Online",
      connectedClients: Math.floor(Math.random() * 30) + 10,
      signalStrength: "-59 dBm",
      frequency: cleanData.frequency || "5GHz 802.11ac",
    };
    const updated = [newAp, ...accessPoints];
    saveState("rackbase_aps", updated, setAccessPoints);
    logActivity("AP Added", `Added Access Point '${newAp.name}' connected to parent router '${parent ? parent.name : cleanData.parentRouterId}'.`, id, "Access Point");
    addToast(`Access Point '${newAp.name}' added`);
    return newAp;
  };

  const updateAccessPoint = (id, data) => {
    const existing = accessPoints.find((ap) => ap.id === id);
    const { serialNumber, managementIp, ...cleanData } = data;
    const updated = accessPoints.map((ap) => (ap.id === id ? { ...ap, ...cleanData } : ap));
    saveState("rackbase_aps", updated, setAccessPoints);

    if (existing && cleanData.parentRouterId && cleanData.parentRouterId !== existing.parentRouterId) {
      const newParent = routers.find((r) => r.id === cleanData.parentRouterId);
      logActivity("AP Reassigned", `Reassigned AP '${existing.name}' to parent router '${newParent?.name || cleanData.parentRouterId}'.`, id, "Access Point");
      addToast(`Moved '${existing.name}' to ${newParent?.name || "new router"}`);
    } else {
      logActivity("Equipment Updated", `Updated details for Access Point '${cleanData.name || id}'.`, id, "Access Point");
      addToast("Access Point updated successfully");
    }
  };

  const deleteAccessPoint = (id) => {
    const apToDelete = accessPoints.find((ap) => ap.id === id);
    const updated = accessPoints.filter((ap) => ap.id !== id);
    saveState("rackbase_aps", updated, setAccessPoints);
    logActivity("Equipment Deleted", `Deleted Access Point '${apToDelete?.name || id}'.`, id, "Access Point");
    addToast(`Access Point '${apToDelete?.name || id}' deleted`, "info");
  };

  // Other Equipment CRUD
  const addOtherEquipment = (data) => {
    const id = `EQ-00${otherEquipment.length + 1}`;
    const newItem = {
      id,
      ...data,
      equipmentType: "Other Network Equipment",
      installationDate: data.installationDate || new Date().toISOString().split("T")[0],
      status: data.status || "Online",
    };
    const updated = [newItem, ...otherEquipment];
    saveState("rackbase_other_eq", updated, setOtherEquipment);
    logActivity("Equipment Added", `Registered network equipment '${newItem.name}' (${newItem.category || "General"}).`, id, "Other Equipment");
    addToast(`Equipment '${newItem.name}' registered`);
    return newItem;
  };

  const updateEquipment = (id, data) => {
    // Check if router, AP, or other
    if (routers.some((r) => r.id === id)) {
      updateRouter(id, data);
    } else if (accessPoints.some((ap) => ap.id === id)) {
      updateAccessPoint(id, data);
    } else {
      const updated = otherEquipment.map((eq) => (eq.id === id ? { ...eq, ...data } : eq));
      saveState("rackbase_other_eq", updated, setOtherEquipment);
      logActivity("Equipment Updated", `Updated network equipment '${data.name || id}'.`, id, "Other Equipment");
      addToast("Equipment updated successfully");
    }
  };

  const deleteEquipment = (id) => {
    if (routers.some((r) => r.id === id)) {
      deleteRouter(id);
    } else if (accessPoints.some((ap) => ap.id === id)) {
      deleteAccessPoint(id);
    } else {
      const itemToDelete = otherEquipment.find((eq) => eq.id === id);
      const updated = otherEquipment.filter((eq) => eq.id !== id);
      saveState("rackbase_other_eq", updated, setOtherEquipment);
      logActivity("Equipment Deleted", `Deleted equipment '${itemToDelete?.name || id}'.`, id, "Other Equipment");
      addToast(`Equipment '${itemToDelete?.name || id}' deleted`, "info");
    }
  };

  // Incident Management
  const reportIncident = (data) => {
    const now = new Date();
    const formatted = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;
    const id = `INC-2026-0${incidents.length + 1 < 10 ? "0" : ""}${incidents.length + 1}`;
    const newIncident = {
      id,
      referenceNumber: id,
      ...data,
      dateReported: formatted,
      status: "Open",
      reportedBy: data.reportedBy || user.name,
      timeline: [
        {
          timestamp: formatted,
          author: user.name,
          status: "Open",
          note: data.description || "Incident logged into Rackbase system.",
        },
      ],
    };
    const updated = [newIncident, ...incidents];
    saveState("rackbase_incidents", updated, setIncidents);
    logActivity("Incident Reported", `Reported incident ${id}: ${newIncident.title} [${newIncident.severity}].`, id, "Incident");
    addToast(`Incident ${id} reported`);
    return newIncident;
  };

  const updateIncident = (id, data) => {
    const updated = incidents.map((inc) => (inc.id === id ? { ...inc, ...data } : inc));
    saveState("rackbase_incidents", updated, setIncidents);
    logActivity("Incident Updated", `Updated details for incident ${id}.`, id, "Incident");
    addToast(`Incident ${id} updated`);
  };

  const assignIncident = (id, technician) => {
    const now = new Date();
    const formatted = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;
    const updated = incidents.map((inc) => {
      if (inc.id === id) {
        return {
          ...inc,
          assignedTechnician: technician,
          timeline: [
            ...inc.timeline,
            {
              timestamp: formatted,
              author: user.name,
              status: inc.status,
              note: `Assigned technician updated to ${technician}.`,
            },
          ],
        };
      }
      return inc;
    });
    saveState("rackbase_incidents", updated, setIncidents);
    logActivity("Incident Assigned", `Assigned technician ${technician} to ${id}.`, id, "Incident");
    addToast(`Assigned ${technician} to ${id}`);
  };

  const updateIncidentStatus = (id, newStatus, note = "", resolutionDetails = "") => {
    const now = new Date();
    const formatted = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;
    const updated = incidents.map((inc) => {
      if (inc.id === id) {
        const newTimeline = [...inc.timeline];
        if (note || newStatus !== inc.status) {
          newTimeline.push({
            timestamp: formatted,
            author: user.name,
            status: newStatus,
            note: note || `Status changed from ${inc.status} to ${newStatus}.`,
          });
        }
        return {
          ...inc,
          status: newStatus,
          resolutionDetails: resolutionDetails || inc.resolutionDetails,
          timeline: newTimeline,
        };
      }
      return inc;
    });
    saveState("rackbase_incidents", updated, setIncidents);

    if (newStatus === "Resolved") {
      logActivity("Incident Resolved", `Resolved incident ${id}: ${note || "Marked resolved by engineer"}.`, id, "Incident");
    } else {
      logActivity("Incident Status Changed", `Updated status of ${id} to '${newStatus}'.`, id, "Incident");
    }
    addToast(`Incident status updated to ${newStatus}`);
  };

  // Maintenance Management
  const addMaintenance = (data) => {
    const id = `MNT-${100 + maintenance.length + 1}`;
    const newRecord = {
      id,
      ...data,
      status: data.status || "Scheduled",
      completedDate: "",
    };
    const updated = [newRecord, ...maintenance];
    saveState("rackbase_maintenance", updated, setMaintenance);
    logActivity("Maintenance Scheduled", `Scheduled maintenance ${id}: ${newRecord.title} for ${newRecord.equipmentName}.`, id, "Maintenance");
    addToast(`Maintenance '${newRecord.title}' scheduled`);
    return newRecord;
  };

  const updateMaintenance = (id, data) => {
    const now = new Date();
    const formatted = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;
    const updated = maintenance.map((m) => {
      if (m.id === id) {
        const isNowCompleted = data.status === "Completed" && m.status !== "Completed";
        return {
          ...m,
          ...data,
          completedDate: isNowCompleted ? formatted : m.completedDate,
        };
      }
      return m;
    });
    saveState("rackbase_maintenance", updated, setMaintenance);

    if (data.status === "Completed") {
      logActivity("Maintenance Completed", `Completed maintenance record ${id}.`, id, "Maintenance");
      addToast(`Maintenance ${id} marked completed`);
    } else {
      logActivity("Maintenance Updated", `Updated maintenance record ${id}.`, id, "Maintenance");
      addToast(`Maintenance ${id} updated`);
    }
  };

  // User Profile & Settings
  const updateUserProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    saveState("rackbase_user", updated, setUser);
    logActivity("Profile Updated", "User updated account contact and organization details.", user.id, "User");
    addToast("Profile details updated successfully");
  };

  const updatePreferences = (preferences) => {
    const updated = { ...user, preferences: { ...user.preferences, ...preferences } };
    saveState("rackbase_user", updated, setUser);
    addToast("Preferences saved");
  };

  // Reset to default seed
  const resetToDefaultData = () => {
    saveState("rackbase_routers", initialRouters, setRouters);
    saveState("rackbase_aps", initialAccessPoints, setAccessPoints);
    saveState("rackbase_other_eq", initialOtherEquipment, setOtherEquipment);
    saveState("rackbase_equipment_models", initialEquipmentModels, setEquipmentModels);
    saveState("rackbase_incidents", initialIncidents, setIncidents);
    saveState("rackbase_maintenance", initialMaintenance, setMaintenance);
    saveState("rackbase_activity_logs", initialActivityLogs, setActivityLogs);
    saveState("rackbase_user", initialUser, setUser);
    addToast("System data reset to initial demo state", "info");
  };

  const value = {
    isClient,
    isAuthenticated,
    user,
    routers,
    accessPoints,
    otherEquipment,
    equipmentModels,
    addEquipmentModel,
    incidents,
    maintenance,
    activityLogs,
    toasts,
    globalSearch,
    setGlobalSearch,
    sidebarCollapsed,
    setSidebarCollapsed,
    login,
    logout,
    addToast,
    removeToast,
    addRouter,
    updateRouter,
    deleteRouter,
    addAccessPoint,
    updateAccessPoint,
    deleteAccessPoint,
    addOtherEquipment,
    updateEquipment,
    deleteEquipment,
    reportIncident,
    updateIncident,
    assignIncident,
    updateIncidentStatus,
    addMaintenance,
    updateMaintenance,
    updateUserProfile,
    updatePreferences,
    resetToDefaultData,
  };

  return <RackbaseContext.Provider value={value}>{children}</RackbaseContext.Provider>;
}

export function useRackbase() {
  const context = useContext(RackbaseContext);
  if (!context) {
    throw new Error("useRackbase must be used within a RackbaseProvider");
  }
  return context;
}

