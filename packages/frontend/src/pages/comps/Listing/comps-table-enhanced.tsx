import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
  LocationOn,
  Business,
} from '@mui/icons-material';
import { IComp } from '@/components/interface/header-filter';
import {
  formatCurrency,
  formatSquareFeet,
  formatAcres,
  formatDate,
  formatPercent,
  getStatusColor,
  getStatusLabel,
  truncateText,
} from '@/utils/comps-helpers';
import { colors, borderRadius, shadows } from '@/utils/design-tokens';
import { listItem } from '@/utils/animations';

interface CompsTableEnhancedProps {
  comps: IComp[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  checkType: string;
  compType: string;
  loading?: boolean;
  selectedIds?: number[];
  onSelectChange?: (ids: number[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

const CompsTableEnhanced: React.FC<CompsTableEnhancedProps> = ({
  comps,
  onView,
  onEdit,
  onDelete,
  checkType,
  compType,
  loading = false,
  selectedIds = [],
  onSelectChange,
  onSort,
}) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('date_sold');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const isCommercial = compType === 'building_with_land';
  const isResidential = compType === 'residential';
  const isLand = compType === 'land_only';
  const isSale = checkType === 'salesCheckbox';

  const handleRowClick = (comp: IComp) => {
    onView(comp.id);
  };

  const handleExpandClick = (e: React.MouseEvent, compId: number) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(compId)) {
      newExpanded.delete(compId);
    } else {
      newExpanded.add(compId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectChange?.(comps.map(comp => comp.id));
    } else {
      onSelectChange?.([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    e.stopPropagation();
    if (e.target.checked) {
      onSelectChange?.([...selectedIds, id]);
    } else {
      onSelectChange?.(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  if (loading) {
    return (
      <Box className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </Box>
    );
  }

  if (comps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Business sx={{ fontSize: 48, color: colors.textLight, mb: 2 }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
          No Comps Found
        </h3>
        <p style={{ color: colors.textLight }}>
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <TableContainer
        component={Box}
        sx={{
          backgroundColor: 'white',
          borderRadius: borderRadius.lg,
          boxShadow: shadows.md,
          overflow: 'hidden',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: colors.navy,
                '& th': {
                  backgroundColor: colors.navy,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '16px',
                  borderBottom: `2px solid ${colors.primary}`,
                },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.length === comps.length}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < comps.length}
                  onChange={handleSelectAll}
                  sx={{ color: 'white', '&.Mui-checked': { color: colors.primary } }}
                />
              </TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Location</TableCell>
              {isSale && <TableCell onClick={() => handleSort('sale_price')} sx={{ cursor: 'pointer' }}>
                Sale Price {sortColumn === 'sale_price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>}
              {!isSale && <TableCell onClick={() => handleSort('lease_rate')} sx={{ cursor: 'pointer' }}>
                Lease Rate {sortColumn === 'lease_rate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>}
              {isCommercial && (
                <>
                  <TableCell>Price/SF</TableCell>
                  <TableCell>Building SF</TableCell>
                  <TableCell>Cap Rate</TableCell>
                </>
              )}
              {isResidential && (
                <>
                  <TableCell>Beds/Baths</TableCell>
                  <TableCell>Square Feet</TableCell>
                  <TableCell>Price/SF</TableCell>
                </>
              )}
              {isLand && (
                <>
                  <TableCell>Acreage</TableCell>
                  <TableCell>Price/Acre</TableCell>
                  <TableCell>Zoning</TableCell>
                </>
              )}
              <TableCell onClick={() => handleSort('date_sold')} sx={{ cursor: 'pointer' }}>
                Date Sold {sortColumn === 'date_sold' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {comps.map((comp, index) => {
                const isExpanded = expandedRows.has(comp.id);
                const isSelected = selectedIds.includes(comp.id);
                const isHovered = hoveredRow === comp.id;
                const statusColor = getStatusColor(comp.comp_status);
                const statusLabel = getStatusLabel(compType, comp.comp_status);

                return (
                  <React.Fragment key={comp.id}>
                    <motion.tr
                      variants={listItem}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      component={TableRow}
                      hover
                      selected={isSelected}
                      onClick={() => handleRowClick(comp)}
                      onMouseEnter={() => setHoveredRow(comp.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: index % 2 === 0 ? 'white' : colors.surfaceDark,
                        '&:hover': {
                          backgroundColor: `${colors.primary}10`,
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(e, comp.id)}
                          sx={{ '&.Mui-checked': { color: colors.primary } }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold"
                            style={{ color: colors.text }}
                            title={comp.street_address || 'N/A'}
                          >
                            {truncateText(comp.street_address, 40) || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" style={{ color: colors.textLight }}>
                          <LocationOn sx={{ fontSize: 16 }} />
                          <span className="text-sm">
                            {comp.city ? `${comp.city}, ` : ''}
                            {comp.state ? comp.state.toUpperCase() : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      {isSale && (
                        <TableCell>
                          <span className="font-bold" style={{ color: colors.primary }}>
                            {formatCurrency(comp.sale_price, 0)}
                          </span>
                        </TableCell>
                      )}
                      {!isSale && (
                        <TableCell>
                          <span className="font-bold" style={{ color: colors.primary }}>
                            {formatCurrency(comp.lease_rate, 2)}
                          </span>
                        </TableCell>
                      )}
                      {isCommercial && (
                        <>
                          <TableCell>{formatCurrency(comp.price_square_foot, 2)}</TableCell>
                          <TableCell>{formatSquareFeet(comp.building_square_footage)}</TableCell>
                          <TableCell>{formatPercent(comp.cap_rate)}</TableCell>
                        </>
                      )}
                      {isResidential && (
                        <>
                          <TableCell>
                            {comp.total_beds || 0} / {comp.total_baths || 0}
                          </TableCell>
                          <TableCell>{formatSquareFeet(comp.building_square_footage)}</TableCell>
                          <TableCell>{formatCurrency(comp.price_square_foot, 2)}</TableCell>
                        </>
                      )}
                      {isLand && (
                        <>
                          <TableCell>{formatAcres(comp.land_acreage)}</TableCell>
                          <TableCell>{formatCurrency(comp.price_acre, 0)}</TableCell>
                          <TableCell>{truncateText(comp.zoning, 20)}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <span className="text-sm" style={{ color: colors.textLight }}>
                          {formatDate(comp.date_sold)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor: statusColor,
                            borderRadius: borderRadius.full,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex gap-1 justify-end">
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(comp.id);
                              }}
                              sx={{ color: colors.primary }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(comp.id);
                              }}
                              sx={{ color: colors.navy }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(comp.id);
                              }}
                              sx={{ color: colors.error }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                            <IconButton
                              size="small"
                              onClick={(e) => handleExpandClick(e, comp.id)}
                              sx={{ color: colors.textLight }}
                            >
                              {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </motion.tr>

                    {/* Expanded Row Content */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={12} sx={{ padding: 0 }}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              backgroundColor: colors.surfaceDark,
                              padding: '16px 24px',
                            }}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {comp.property_type && (
                                <div>
                                  <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                                    Property Type
                                  </div>
                                  <div className="text-sm" style={{ color: colors.text }}>
                                    {comp.property_type}
                                  </div>
                                </div>
                              )}
                              {comp.year_built && (
                                <div>
                                  <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                                    Year Built
                                  </div>
                                  <div className="text-sm" style={{ color: colors.text }}>
                                    {comp.year_built}
                                  </div>
                                </div>
                              )}
                              {comp.stories && (
                                <div>
                                  <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                                    Stories
                                  </div>
                                  <div className="text-sm" style={{ color: colors.text }}>
                                    {comp.stories}
                                  </div>
                                </div>
                              )}
                              {comp.occupancy_percent !== null && (
                                <div>
                                  <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                                    Occupancy
                                  </div>
                                  <div className="text-sm" style={{ color: colors.text }}>
                                    {formatPercent(comp.occupancy_percent)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CompsTableEnhanced;


















