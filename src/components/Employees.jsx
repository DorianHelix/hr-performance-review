import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Plus, Upload, Trash2, Settings, PlusCircle, X,
  Network, Minus, Maximize2, Edit2
} from 'lucide-react';
import SectionHeader from './SectionHeader';

// Utility functions
function uid() { 
  return Math.random().toString(36).slice(2, 9); 
}

function lsRead(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Constants
const LS_EMPLOYEES = "hr_weekly_employees";

// OrgChart Component
function OrgChart({ employees, setEmployees, onQuickAdd, onEditEmployee, onDeleteEmployee, zoom, onZoomChange, isDarkMode, isFullscreen }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [selectionBox, setSelectionBox] = useState(null);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);

  useEffect(() => {
    // Build hierarchy and calculate positions
    const buildHierarchy = () => {
      const nodeMap = {};
      const roots = [];
      const levels = {};
      
      // First pass: create all nodes  
      (employees || []).forEach(emp => {
        nodeMap[emp.id] = {
          ...emp,
          width: 200,
          height: 80,
          children: []
        };
      });
      
      // Second pass: build relationships
      (employees || []).forEach(emp => {
        if (emp.managerId && nodeMap[emp.managerId]) {
          nodeMap[emp.managerId].children.push(emp.id);
        } else if (!emp.managerId) {
          roots.push(emp.id);
        }
      });
      
      // Calculate levels
      const calculateLevel = (nodeId, level = 0) => {
        levels[nodeId] = level;
        const node = nodeMap[nodeId];
        if (node && node.children) {
          node.children.forEach(childId => {
            calculateLevel(childId, level + 1);
          });
        }
      };
      
      roots.forEach(rootId => calculateLevel(rootId));
      
      // Group nodes by level
      const levelGroups = {};
      Object.entries(levels).forEach(([nodeId, level]) => {
        if (!levelGroups[level]) levelGroups[level] = [];
        levelGroups[level].push(nodeId);
      });
      
      // Position nodes with more spacing - centered in larger canvas
      const HORIZONTAL_SPACING = 320;
      const VERTICAL_SPACING = 200;
      const START_Y = isFullscreen ? 2500 : 1600;
      
      Object.entries(levelGroups).forEach(([level, nodeIds]) => {
        const levelNum = parseInt(level);
        const totalWidth = nodeIds.length * HORIZONTAL_SPACING;
        const canvasWidth = isFullscreen ? 10000 : 6000;
        const startX = (canvasWidth - totalWidth) / 2 + HORIZONTAL_SPACING / 2;
        
        nodeIds.forEach((nodeId, index) => {
          if (nodeMap[nodeId]) {
            nodeMap[nodeId].x = startX + index * HORIZONTAL_SPACING;
            nodeMap[nodeId].y = START_Y + levelNum * VERTICAL_SPACING;
          }
        });
      });
      
      return nodeMap;
    };
    
    setNodes(buildHierarchy());
  }, [employees, isFullscreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Handle high-DPI displays for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size (css pixels) - doubled for more workspace
    const displayWidth = isFullscreen ? 10000 : 6000;
    const displayHeight = isFullscreen ? 6000 : 4000;
    
    // Set actual canvas size accounting for device pixel ratio
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Scale the drawing context to match device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate((displayWidth * (1 - zoom)) / (2 * zoom) + panOffset.x / zoom, (displayHeight * (1 - zoom)) / (2 * zoom) + panOffset.y / zoom);
    
    // Enable better text rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas with larger area
    ctx.clearRect(-displayWidth * 2, -displayHeight * 2, displayWidth * 5, displayHeight * 5);
    
    // Draw connections first (behind nodes)
    Object.values(nodes).forEach(node => {
      if (node.managerId) {
        const managerNode = nodes[node.managerId];
        if (managerNode) {
          const startX = managerNode.x + managerNode.width / 2;
          const startY = managerNode.y + managerNode.height;
          const endX = node.x + node.width / 2;
          const endY = node.y;
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          
          // Create gradient for connection lines
          const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
          
          if (isDarkMode) {
            gradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
            gradient.addColorStop(1, 'rgba(167, 139, 250, 0.3)');
          } else {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
          }
          
          // Highlight if hovered
          if (hoveredConnection === node.id) {
            ctx.strokeStyle = isDarkMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.4)';
            ctx.lineWidth = 3;
          } else {
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
          }
          
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          const controlPointOffset = Math.abs(endY - startY) * 0.5;
          
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            startX, startY + controlPointOffset,
            endX, endY - controlPointOffset,
            endX, endY
          );
          ctx.stroke();
          
          // Add small dot at connection points
          ctx.fillStyle = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
          ctx.beginPath();
          ctx.arc(startX, startY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw X button if hovered
          if (hoveredConnection === node.id) {
            // Draw X background
            ctx.fillStyle = isDarkMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.8)';
            ctx.beginPath();
            ctx.arc(midX, midY, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw X
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX - 5, midY - 5);
            ctx.lineTo(midX + 5, midY + 5);
            ctx.moveTo(midX + 5, midY - 5);
            ctx.lineTo(midX - 5, midY + 5);
            ctx.stroke();
          }
        }
      }
    });
    
    // Draw temporary connection when dragging
    if (isDrawingConnection && connectionStart) {
      ctx.strokeStyle = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(connectionStart.x, connectionStart.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw selection box
    if (isMultiSelecting && selectionBox) {
      ctx.strokeStyle = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
      ctx.fillStyle = isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      const x = Math.min(selectionBox.startX, selectionBox.endX);
      const y = Math.min(selectionBox.startY, selectionBox.endY);
      const width = Math.abs(selectionBox.endX - selectionBox.startX);
      const height = Math.abs(selectionBox.endY - selectionBox.startY);
      
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
    
    // Draw nodes
    Object.entries(nodes).forEach(([id, node]) => {
      const isSelected = selectedNodes.has(id);
      
      // Enhanced shadows for depth
      if (isSelected) {
        ctx.shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
      }
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      
      // Draw node background with gradient
      const nodeGradient = ctx.createLinearGradient(node.x, node.y, node.x, node.y + node.height);
      
      if (isDarkMode) {
        if (isSelected) {
          nodeGradient.addColorStop(0, 'rgba(96, 165, 250, 0.2)');
          nodeGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
        } else {
          nodeGradient.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
          nodeGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        }
      } else {
        if (isSelected) {
          nodeGradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
          nodeGradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
        } else {
          nodeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          nodeGradient.addColorStop(1, 'rgba(248, 250, 252, 0.95)');
        }
      }
      
      ctx.fillStyle = nodeGradient;
      ctx.strokeStyle = isSelected 
        ? (isDarkMode ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.5)')
        : (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)');
      ctx.lineWidth = isSelected ? 2 : 1;
      
      // Draw rounded rectangle
      const radius = 12;
      ctx.beginPath();
      ctx.moveTo(node.x + radius, node.y);
      ctx.lineTo(node.x + node.width - radius, node.y);
      ctx.quadraticCurveTo(node.x + node.width, node.y, node.x + node.width, node.y + radius);
      ctx.lineTo(node.x + node.width, node.y + node.height - radius);
      ctx.quadraticCurveTo(node.x + node.width, node.y + node.height, node.x + node.width - radius, node.y + node.height);
      ctx.lineTo(node.x + radius, node.y + node.height);
      ctx.quadraticCurveTo(node.x, node.y + node.height, node.x, node.y + node.height - radius);
      ctx.lineTo(node.x, node.y + radius);
      ctx.quadraticCurveTo(node.x, node.y, node.x + radius, node.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Reset shadow for text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Draw node content with better typography
      ctx.fillStyle = isDarkMode ? '#f3f4f6' : '#1f2937';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(node.name || 'Unknown', node.x + 12, node.y + 28);
      
      ctx.fillStyle = isDarkMode ? 'rgba(156, 163, 175, 0.9)' : 'rgba(107, 114, 128, 0.9)';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(node.role || 'No role', node.x + 12, node.y + 48);
      
      ctx.fillStyle = isDarkMode ? 'rgba(139, 92, 246, 0.9)' : 'rgba(109, 40, 217, 0.9)';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(node.division || 'No division', node.x + 12, node.y + 65);
      
      // Draw connection handle at bottom
      const handleX = node.x + node.width / 2;
      const handleY = node.y + node.height;
      
      ctx.fillStyle = isDarkMode ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.5)';
      ctx.beginPath();
      ctx.arc(handleX, handleY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Store button positions for click detection
      node.gearButton = { x: node.x + node.width - 30, y: node.y + 10 };
      node.deleteButton = { x: node.x + node.width - 30, y: node.y + 35 };
      
      // Draw interactive buttons (gear and delete) on hover or selection
      ctx.fillStyle = isDarkMode ? 'rgba(156, 163, 175, 0.4)' : 'rgba(107, 114, 128, 0.3)';
      ctx.beginPath();
      ctx.arc(node.gearButton.x, node.gearButton.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw gear icon
      ctx.save();
      ctx.translate(node.gearButton.x, node.gearButton.y);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const innerRadius = 3;
        const outerRadius = 5;
        const x1 = Math.cos(angle) * (i % 2 === 0 ? outerRadius : innerRadius);
        const y1 = Math.sin(angle) * (i % 2 === 0 ? outerRadius : innerRadius);
        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      
      // Draw delete button
      ctx.fillStyle = isDarkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(node.deleteButton.x, node.deleteButton.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw X icon
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(node.deleteButton.x - 3, node.deleteButton.y - 3);
      ctx.lineTo(node.deleteButton.x + 3, node.deleteButton.y + 3);
      ctx.moveTo(node.deleteButton.x + 3, node.deleteButton.y - 3);
      ctx.lineTo(node.deleteButton.x - 3, node.deleteButton.y + 3);
      ctx.stroke();
    });
    
    ctx.restore();
  }, [nodes, zoom, hoveredConnection, isDrawingConnection, connectionStart, mousePos, panOffset, selectedNodes, selectionBox, isMultiSelecting, isDarkMode]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = isFullscreen ? 10000 : 6000;
    const canvasHeight = isFullscreen ? 6000 : 4000;
    const rawX = (e.clientX - rect.left) * (canvasWidth / rect.width);
    const rawY = (e.clientY - rect.top) * (canvasHeight / rect.height);
    
    // Adjust for zoom, translation and pan
    const x = (rawX - (canvasWidth * (1 - zoom)) / 2 - panOffset.x) / zoom;
    const y = (rawY - (canvasHeight * (1 - zoom)) / 2 - panOffset.y) / zoom;
    
    // Check if clicking on X button to remove connection
    if (hoveredConnection) {
      const node = nodes[hoveredConnection];
      if (node && node.managerId) {
        const updatedEmployees = employees.map(emp => 
          emp.id === hoveredConnection ? { ...emp, managerId: null } : emp
        );
        setEmployees(updatedEmployees);
        lsWrite(LS_EMPLOYEES, updatedEmployees);
      }
      return;
    }
    
    // Check button clicks
    for (const [id, node] of Object.entries(nodes)) {
      // Check gear button click
      if (node.gearButton && Math.abs(x - node.gearButton.x) < 10 && Math.abs(y - node.gearButton.y) < 10) {
        const employee = employees.find(emp => emp.id === id);
        if (employee && onEditEmployee) {
          onEditEmployee(employee);
        }
        return;
      }
      
      // Check delete button click
      if (node.deleteButton && Math.abs(x - node.deleteButton.x) < 10 && Math.abs(y - node.deleteButton.y) < 10) {
        const employee = employees.find(emp => emp.id === id);
        if (employee) {
          const message = `Are you sure you want to delete ${employee.name}?\n\nThis will permanently remove the employee and all associated data from the database.`;
          if (confirm(message)) {
            if (onDeleteEmployee) {
              onDeleteEmployee(id);
            }
          }
        }
        return;
      }
    }
    
    // Check if clicking on connection handle
    for (const [id, node] of Object.entries(nodes)) {
      const handleX = node.x + node.width / 2;
      const handleY = node.y + node.height;
      if (Math.abs(x - handleX) < 10 && Math.abs(y - handleY) < 10) {
        setIsDrawingConnection(true);
        setConnectionStart({ nodeId: id, x: handleX, y: handleY });
        canvas.style.cursor = 'crosshair';
        return;
      }
    }
    
    // Check if Shift is held for multi-select
    if (e.shiftKey) {
      setIsMultiSelecting(true);
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setSelectionBox({ 
        startX: x, 
        startY: y, 
        endX: x, 
        endY: y,
        mouseStartX: mouseX,
        mouseStartY: mouseY
      });
      canvas.style.cursor = 'crosshair';
      return;
    }
    
    // Find which node was clicked for dragging
    let nodeClicked = false;
    for (const [id, node] of Object.entries(nodes)) {
      if (x >= node.x && x <= node.x + node.width &&
          y >= node.y && y <= node.y + node.height) {
        
        // If the node is part of selected nodes, drag all selected
        if (selectedNodes.has(id)) {
          setDragging('multiple');
          setDragStart({ x, y });
        } else {
          // Clear selection and drag only this node
          setSelectedNodes(new Set());
          setDragging(id);
          setDragStart({ x: x - node.x, y: y - node.y });
        }
        canvas.style.cursor = 'grabbing';
        nodeClicked = true;
        break;
      }
    }
    
    // If no node was clicked, clear selection and start panning
    if (!nodeClicked && !isDrawingConnection) {
      setSelectedNodes(new Set());
      setIsPanning(true);
      setPanStart({ x: rawX, y: rawY });
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = isFullscreen ? 10000 : 6000;
    const canvasHeight = isFullscreen ? 6000 : 4000;
    const rawX = (e.clientX - rect.left) * (canvasWidth / rect.width);
    const rawY = (e.clientY - rect.top) * (canvasHeight / rect.height);
    
    // Adjust for zoom, translation and pan
    const x = (rawX - (canvasWidth * (1 - zoom)) / 2 - panOffset.x) / zoom;
    const y = (rawY - (canvasHeight * (1 - zoom)) / 2 - panOffset.y) / zoom;
    
    setMousePos({ x, y });
    
    if (isMultiSelecting && selectionBox) {
      // Update selection box
      setSelectionBox(prev => ({ ...prev, endX: x, endY: y }));
      
      // Find nodes within selection box - check for overlap instead of full containment
      const minX = Math.min(selectionBox.startX, x);
      const maxX = Math.max(selectionBox.startX, x);
      const minY = Math.min(selectionBox.startY, y);
      const maxY = Math.max(selectionBox.startY, y);
      
      const selected = new Set();
      Object.entries(nodes).forEach(([id, node]) => {
        // Check if selection box overlaps with node (not just fully contains)
        const nodeLeft = node.x;
        const nodeRight = node.x + node.width;
        const nodeTop = node.y;
        const nodeBottom = node.y + node.height;
        
        // Check for overlap: if rectangles intersect
        if (!(nodeRight < minX || nodeLeft > maxX || nodeBottom < minY || nodeTop > maxY)) {
          selected.add(id);
        }
      });
      setSelectedNodes(selected);
      return;
    }
    
    if (isDrawingConnection) {
      canvas.style.cursor = 'crosshair';
      return;
    }
    
    if (isPanning) {
      // Update pan offset
      const deltaX = rawX - panStart.x;
      const deltaY = rawY - panStart.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: rawX, y: rawY });
      canvas.style.cursor = 'grabbing';
    } else if (dragging === 'multiple') {
      // Move all selected nodes together
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      setNodes(prev => {
        const updated = { ...prev };
        selectedNodes.forEach(id => {
          if (updated[id]) {
            updated[id] = {
              ...updated[id],
              x: Math.max(-3000, Math.min(12000, updated[id].x + deltaX)),
              y: Math.max(-2000, Math.min(8000, updated[id].y + deltaY))
            };
          }
        });
        return updated;
      });
      setDragStart({ x, y });
    } else if (dragging) {
      setNodes(prev => ({
        ...prev,
        [dragging]: {
          ...prev[dragging],
          x: Math.max(-3000, Math.min(12000, x - dragStart.x)),
          y: Math.max(-2000, Math.min(8000, y - dragStart.y))
        }
      }));
    } else {
      // Check if hovering over connection X button
      let foundConnection = null;
      Object.values(nodes).forEach(node => {
        if (node.managerId && nodes[node.managerId]) {
          const managerNode = nodes[node.managerId];
          const midX = (managerNode.x + managerNode.width / 2 + node.x + node.width / 2) / 2;
          const midY = (managerNode.y + managerNode.height + node.y) / 2;
          
          if (Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2)) < 15) {
            foundConnection = node.id;
          }
        }
      });
      
      setHoveredConnection(foundConnection);
      
      if (foundConnection) {
        canvas.style.cursor = 'pointer';
      } else {
        // Check if hovering over connection handle
        let hoveringHandle = false;
        for (const node of Object.values(nodes)) {
          const handleX = node.x + node.width / 2;
          const handleY = node.y + node.height;
          if (Math.abs(x - handleX) < 10 && Math.abs(y - handleY) < 10) {
            hoveringHandle = true;
            break;
          }
        }
        
        if (hoveringHandle) {
          canvas.style.cursor = 'crosshair';
        } else {
          // Check if hovering over node
          let hovered = false;
          for (const node of Object.values(nodes)) {
            if (x >= node.x && x <= node.x + node.width &&
                y >= node.y && y <= node.y + node.height) {
              hovered = true;
              break;
            }
          }
          canvas.style.cursor = hovered ? 'grab' : 'default';
        }
      }
    }
  };

  const handleMouseUp = (e) => {
    const canvas = canvasRef.current;
    
    if (isDrawingConnection) {
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = isFullscreen ? 10000 : 6000;
      const canvasHeight = isFullscreen ? 6000 : 4000;
      const rawX = (e.clientX - rect.left) * (canvasWidth / rect.width);
      const rawY = (e.clientY - rect.top) * (canvasHeight / rect.height);
      
      // Adjust for zoom, translation and pan
      const x = (rawX - (canvasWidth * (1 - zoom)) / 2 - panOffset.x) / zoom;
      const y = (rawY - (canvasHeight * (1 - zoom)) / 2 - panOffset.y) / zoom;
      
      // Find which node we're dropping on
      let foundTarget = false;
      for (const [id, node] of Object.entries(nodes)) {
        if (x >= node.x && x <= node.x + node.width &&
            y >= node.y && y <= node.y + node.height &&
            id !== connectionStart.nodeId) {
          // Create new manager relationship
          const updatedEmployees = employees.map(emp => 
            emp.id === id ? { ...emp, managerId: connectionStart.nodeId } : emp
          );
          setEmployees(updatedEmployees);
          lsWrite(LS_EMPLOYEES, updatedEmployees);
          foundTarget = true;
          break;
        }
      }
      
      // If dropped on empty canvas, trigger quick add modal
      if (!foundTarget && connectionStart && onQuickAdd) {
        onQuickAdd({ 
          managerId: connectionStart.nodeId,
          position: { x, y }
        });
      }
      
      setIsDrawingConnection(false);
      setConnectionStart(null);
    }
    
    setDragging(null);
    setIsPanning(false);
    setIsMultiSelecting(false);
    setSelectionBox(null);
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  };

  // Handle wheel zoom with Cmd/Ctrl
  const handleWheel = (e) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      onZoomChange(prev => Math.max(0.25, Math.min(5, prev + delta)));
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={isFullscreen ? 10000 : 6000}
      height={isFullscreen ? 6000 : 4000}
      className={`${isFullscreen ? 'w-full h-full' : 'w-full rounded-xl'}`}
      style={{ 
        background: isDarkMode 
          ? 'rgba(0, 0, 0, 0.2)' 
          : 'rgba(0, 0, 0, 0.05)',
        border: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(0, 0, 0, 0.15)',
        ...(isFullscreen ? {
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        } : {
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: '6000 / 4000'
        })
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
}

// Main Employees Component
function Employees({ isDarkMode }) {
  const [employees, setEmployees] = useState(() => {
    const data = lsRead(LS_EMPLOYEES, []);
    return Array.isArray(data) ? data : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [quickAddModal, setQuickAddModal] = useState(null); // For quick employee creation
  const [zoom, setZoom] = useState(2.5); // Zoom state for org chart - default 250%
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state for org chart
  const [showSidebar, setShowSidebar] = useState(true);
  const [showKPICards, setShowKPICards] = useState(true);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const chartContainer = document.getElementById('org-chart-container');
    if (!document.fullscreenElement) {
      chartContainer?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Add new employee
  const handleAddEmployee = (employeeData) => {
    const newEmployee = {
      id: `emp-${uid()}`,
      ...employeeData,
      startDate: employeeData.startDate || new Date().toISOString().split('T')[0]
    };
    
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setShowAddModal(false);
  };

  // Update employee
  const handleUpdateEmployee = (id, updates) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    );
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setEditingEmployee(null);
  };

  // Delete employee
  const handleDeleteEmployee = (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    
    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
  };

  // Filter employees
  const filteredEmployees = (employees || []).filter(emp => {
    if (!emp || !emp.name) return false;
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = !filterDepartment || emp.division === filterDepartment;
    return matchesSearch && matchesDivision;
  });

  // Get unique divisions
  const departments = [...new Set((employees || []).map(emp => emp?.division))].filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={Users}
        iconColorClass="from-blue-400/20 to-purple-600/20"
        iconBorderClass="border-blue-400/30"
        iconColor="text-blue-300"
        title="Employee Management"
        subtitle="Manage your team members and organizational structure"
        showKPICards={showKPICards}
        onToggleKPICards={() => setShowKPICards(prev => !prev)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
      />

      {/* KPI Cards */}
      {showKPICards && (
        <div className="flex gap-4 mx-6 mb-4 overflow-x-auto">
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex-shrink-0" style={{minWidth: '180px'}}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-400" size={20} />
              <h3 className="font-semibold text-white">Total Employees</h3>
            </div>
            <div className="text-3xl font-bold text-white">{employees.length}</div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex-shrink-0" style={{minWidth: '180px'}}>
            <div className="flex items-center gap-3 mb-2">
              <Network className="text-purple-400" size={20} />
              <h3 className="font-semibold text-white">Departments</h3>
            </div>
            <div className="text-3xl font-bold text-white">{departments.length}</div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex-shrink-0" style={{minWidth: '180px'}}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-green-400" size={20} />
              <h3 className="font-semibold text-white">Managers</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {employees.filter(e => employees.some(emp => emp.managerId === e.id)).length}
            </div>
          </div>
        </div>
      )}

      <div className={`grid ${showSidebar ? 'lg:grid-cols-[1fr,20rem]' : 'lg:grid-cols-1'} grid-cols-1 gap-6 flex-1 min-h-0 px-6 pb-6`}>
        {/* Main Content */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          {/* Search and Filter Bar - Only show in table view */}
          {viewMode === 'table' && (
            <div className="glass-card-large p-4 mb-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-2"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="glass-input px-4 py-2"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* View Toggle and Table/Chart */}
          <div className="glass-card-large flex flex-col overflow-hidden flex-1">
            {/* View Mode Toggle */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="inline-flex p-1 rounded-2xl" style={{ 
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(20px)',
                boxShadow: isDarkMode 
                  ? '0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'table' 
                      ? 'text-white'
                      : isDarkMode ? 'text-white/60 hover:text-white/80' : 'text-black/50 hover:text-black/70'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {viewMode === 'table' && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  )}
                  <Users size={16} className={`relative z-10 ${viewMode === 'table' ? '!text-white' : ''}`} />
                  <span className={`relative z-10 text-xs ${viewMode === 'table' ? '!text-white' : ''}`}>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'chart' 
                      ? 'text-white'
                      : isDarkMode ? 'text-white/60 hover:text-white/80' : 'text-black/50 hover:text-black/70'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {viewMode === 'chart' && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  )}
                  <Network size={16} className={`relative z-10 ${viewMode === 'chart' ? '!text-white' : ''}`} />
                  <span className={`relative z-10 text-xs ${viewMode === 'chart' ? '!text-white' : ''}`}>Org Chart</span>
                </button>
              </div>
              
              {/* Fullscreen button (only for chart view) */}
              {viewMode === 'chart' && !isFullscreen && (
                <button 
                  onClick={toggleFullscreen}
                  className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 text-white hover:scale-105 transition-transform"
                  title="Enter Fullscreen"
                >
                  <Maximize2 size={18} />
                  <span className="font-medium">Fullscreen</span>
                </button>
              )}
              
              {/* Close button when in fullscreen */}
              {viewMode === 'chart' && isFullscreen && (
                <button 
                  onClick={toggleFullscreen}
                  className="glass-button w-10 h-10 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform"
                  title="Exit Fullscreen"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Content Area */}
            {viewMode === 'table' ? (
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/70 font-medium">ID</th>
                      <th className="text-left p-4 text-white/70 font-medium">Name</th>
                      <th className="text-left p-4 text-white/70 font-medium">Division</th>
                      <th className="text-left p-4 text-white/70 font-medium">Role</th>
                      <th className="text-left p-4 text-white/70 font-medium">Manager</th>
                      <th className="text-left p-4 text-white/70 font-medium">Start Date</th>
                      <th className="text-center p-4 text-white/70 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-8 text-white/50">
                          No employees found. Add your first employee to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => (
                        <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-blue-300">{emp.employeeId || '-'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-white">{emp.name}</div>
                          </td>
                          <td className="p-4 text-white/70">{emp.division || '-'}</td>
                          <td className="p-4 text-white/70">{emp.role || '-'}</td>
                          <td className="p-4 text-white/70">
                            {emp.managerId ? employees.find(m => m.id === emp.managerId)?.name || 'Unknown' : '-'}
                          </td>
                          <td className="p-4 text-white/70">
                            {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingEmployee(emp)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Edit"
                              >
                                <Settings size={16} className="text-white/70" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div id="org-chart-container" className={`${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none flex flex-col' : 'flex-1 p-6 relative'}`} 
                   style={isFullscreen ? { background: isDarkMode ? '#0a0a0a' : '#f5f7fa', width: '100vw', height: '100vh' } : {}}>
                <OrgChart 
                  employees={employees}
                  setEmployees={setEmployees}
                  onQuickAdd={setQuickAddModal}
                  onEditEmployee={setEditingEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  isDarkMode={isDarkMode}
                  isFullscreen={isFullscreen}
                />
                
                {/* Zoom Controls */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <div className="glass-card px-3 py-1 rounded-full text-white text-sm font-medium text-center mb-2">
                    {Math.round(zoom * 100)}%
                  </div>
                  <button 
                    onClick={() => setZoom(prev => Math.min(prev + 0.2, 5))}
                    className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    title="Zoom In"
                  >
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.25))}
                    className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    title="Zoom Out"
                  >
                    <Minus size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Add Employee Widget */}
        {showSidebar && (
          <div className="space-y-6 overflow-y-auto">
            <div className="glass-card-large p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-400" />
                Add New Employee
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Employee
                </button>
                
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Bulk Import
                </button>
                
                {employees.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete ALL employees? This action cannot be undone.')) {
                        setEmployees([]);
                        lsWrite(LS_EMPLOYEES, []);
                      }
                    }}
                    className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white hover:scale-105"
                  >
                    <Trash2 size={20} />
                    Delete All Employees
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-white/70 mb-2">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Total Employees</span>
                      <span className="text-sm font-medium text-white">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Departments</span>
                      <span className="text-sm font-medium text-white">{departments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/50">Managers</span>
                      <span className="text-sm font-medium text-white">
                        {employees.filter(e => employees.some(emp => emp.managerId === e.id)).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20">
                  <h4 className="text-sm font-medium text-white mb-2">Recent Activity</h4>
                  <p className="text-xs text-white/60">
                    {employees.length > 0 
                      ? `Last employee added: ${employees[employees.length - 1].name}`
                      : 'No employees added yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editingEmployee) && (
        <AddEmployeeModal
          employee={editingEmployee}
          employees={employees}
          onSave={(data) => {
            if (editingEmployee) {
              handleUpdateEmployee(editingEmployee.id, data);
            } else {
              handleAddEmployee(data);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
        />
      )}
      
      {quickAddModal && (
        <QuickAddEmployeeModal
          managerId={quickAddModal.managerId}
          employees={employees}
          onSave={(name) => {
            const newEmployee = {
              id: `emp-${uid()}`,
              employeeId: '',
              name,
              managerId: quickAddModal.managerId,
              division: '',
              squad: '',
              team: '',
              role: '',
              seniority: '',
              birthday: '',
              startDate: new Date().toISOString().split('T')[0],
              exitDate: '',
              netSalary: '',
              grossSalary: '',
              totalSalary: ''
            };
            
            const updated = [...employees, newEmployee];
            setEmployees(updated);
            lsWrite(LS_EMPLOYEES, updated);
            setQuickAddModal(null);
          }}
          onClose={() => setQuickAddModal(null)}
        />
      )}

      {showBulkImportModal && (
        <BulkImportModal
          onSave={(importedEmployees) => {
            const updated = [...employees, ...importedEmployees];
            setEmployees(updated);
            lsWrite(LS_EMPLOYEES, updated);
            setShowBulkImportModal(false);
          }}
          onClose={() => setShowBulkImportModal(false)}
        />
      )}
    </div>
  );
}

// Modal Components
function AddEmployeeModal({ employee, employees, onSave, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId || '',
    name: employee?.name || '',
    division: employee?.division || '',
    squad: employee?.squad || '',
    team: employee?.team || '',
    role: employee?.role || '',
    seniority: employee?.seniority || '',
    managerId: employee?.managerId || '',
    birthday: employee?.birthday || '',
    startDate: employee?.startDate || '',
    exitDate: employee?.exitDate || '',
    netSalary: employee?.netSalary || '',
    grossSalary: employee?.grossSalary || '',
    totalSalary: employee?.totalSalary || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Employee name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Users size={24} />
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="EMP001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full glass-input px-4 py-2"
                required
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Division</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Engineering"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Squad</label>
              <input
                type="text"
                value={formData.squad}
                onChange={(e) => setFormData({...formData, squad: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Platform"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Team</label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Backend"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Software Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Seniority</label>
              <select
                value={formData.seniority}
                onChange={(e) => setFormData({...formData, seniority: e.target.value})}
                className="w-full glass-input px-4 py-2"
              >
                <option value="">Select Seniority</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Principal">Principal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Manager</label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({...formData, managerId: e.target.value})}
              className="w-full glass-input px-4 py-2"
            >
              <option value="">No Manager</option>
              {employees.filter(emp => emp.id !== employee?.id).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Exit Date</label>
              <input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Net Salary</label>
              <input
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData({...formData, netSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="50000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Gross Salary</label>
              <input
                type="number"
                value={formData.grossSalary}
                onChange={(e) => setFormData({...formData, grossSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="65000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Total Salary</label>
              <input
                type="number"
                value={formData.totalSalary}
                onChange={(e) => setFormData({...formData, totalSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="75000"
              />
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
          >
            {employee ? 'Update' : 'Add'} Employee
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickAddEmployeeModal({ managerId, employees, onSave, onClose }) {
  const [name, setName] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }
    onSave(name);
  };

  const manager = employees.find(emp => emp.id === managerId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Quick Add Employee</h2>
          {manager && (
            <p className="text-sm text-white/60 mt-1">
              Reporting to: {manager.name}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Employee Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input px-4 py-2"
              placeholder="Enter employee name"
              autoFocus
              required
            />
          </div>
        </form>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
          >
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkImportModal({ onSave, onClose }) {
  const [csvData, setCsvData] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const expectedHeaders = [
    'Employee ID', 'Name', 'Division', 'Squad', 'Team', 'Role', 'Seniority', 
    'Manager', 'Birthday', 'Start Date', 'Exit Date', 
    'Net Salary', 'Gross Salary', 'Total Salary'
  ];

  const sampleCSV = expectedHeaders.join(',') + '\n' +
    'EMP001,John Doe,Engineering,Platform,Backend,Software Engineer,Senior,,1990-01-15,2020-03-01,,50000,65000,75000\n' +
    'EMP002,Jane Smith,Product,Growth,Analytics,Product Manager,Lead,John Doe,1988-06-22,2019-07-15,,60000,78000,90000';

  const processCsvData = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      alert('Please provide at least one row of data');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const employees = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const emp = {
        id: `emp-${uid()}`,
        employeeId: values[0] || '',
        name: values[1] || '',
        division: values[2] || '',
        squad: values[3] || '',
        team: values[4] || '',
        role: values[5] || '',
        seniority: values[6] || '',
        managerId: '', // Will be resolved later
        managerName: values[7] || '',
        birthday: values[8] || '',
        startDate: values[9] || '',
        exitDate: values[10] || '',
        netSalary: values[11] || '',
        grossSalary: values[12] || '',
        totalSalary: values[13] || ''
      };
      
      if (emp.name) {
        employees.push(emp);
      }
    }

    setPreviewData(employees);
  };

  const handleImport = () => {
    if (!previewData || previewData.length === 0) {
      alert('No valid data to import');
      return;
    }

    // Resolve manager relationships
    const employeeMap = {};
    previewData.forEach(emp => {
      employeeMap[emp.name] = emp.id;
    });

    const finalEmployees = previewData.map(emp => {
      const { managerName, ...employeeData } = emp;
      if (managerName && employeeMap[managerName]) {
        employeeData.managerId = employeeMap[managerName];
      }
      return employeeData;
    });

    onSave(finalEmployees);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Upload size={24} />
            Bulk Import Employees
          </h2>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/80 mb-2">Expected CSV Format:</h3>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 font-mono overflow-x-auto">
              {expectedHeaders.join(', ')}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-2">Paste CSV Data:</label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-48 glass-input px-4 py-2 font-mono text-sm"
              placeholder={sampleCSV}
            />
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => processCsvData(csvData)}
              className="glass-button px-4 py-2 font-medium hover:scale-105 transition-transform"
            >
              Preview Import
            </button>
            <button
              onClick={() => setCsvData(sampleCSV)}
              className="glass-button px-4 py-2 font-medium hover:scale-105 transition-transform"
            >
              Load Sample Data
            </button>
          </div>

          {previewData && (
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2">
                Preview ({previewData.length} employees):
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-2 text-white/70">Name</th>
                      <th className="text-left p-2 text-white/70">Division</th>
                      <th className="text-left p-2 text-white/70">Role</th>
                      <th className="text-left p-2 text-white/70">Manager</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((emp, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="p-2 text-white">{emp.name}</td>
                        <td className="p-2 text-white/70">{emp.division || '-'}</td>
                        <td className="p-2 text-white/70">{emp.role || '-'}</td>
                        <td className="p-2 text-white/70">{emp.managerName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p className="text-xs text-white/50 mt-2">
                    ... and {previewData.length - 10} more employees
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData || previewData.length === 0}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {previewData ? previewData.length : 0} Employees
          </button>
        </div>
      </div>
    </div>
  );
}

export default Employees;