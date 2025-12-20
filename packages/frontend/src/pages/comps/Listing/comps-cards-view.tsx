import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LocationOn,
  CalendarToday,
  Business,
  Edit,
  Visibility,
  Delete,
  Home,
  Terrain,
} from '@mui/icons-material';
import { IComp } from '@/components/interface/header-filter';
import {
  formatCurrency,
  formatSquareFeet,
  formatAcres,
  formatDate,
  formatPercent,
  getPropertyTypeColor,
  getStatusColor,
  getStatusLabel,
  truncateText,
  getImageUrl,
  getPricePerUnit,
} from '@/utils/comps-helpers';
import { colors, borderRadius, shadows } from '@/utils/design-tokens';
import { cardContainer, cardItem, cardHover } from '@/utils/animations';
import NoImageUpload from '../../../images/Group 1549.png';

interface CompsCardsViewProps {
  comps: IComp[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  checkType: string;
  compType: string; // 'building_with_land', 'land_only', 'residential'
  loading?: boolean;
  selectedIds?: number[];
  onSelectChange?: (ids: number[]) => void;
}

const CompsCardsView: React.FC<CompsCardsViewProps> = ({
  comps,
  onView,
  onEdit,
  onDelete,
  checkType,
  compType,
  loading = false,
  selectedIds = [],
  onSelectChange,
}) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const isCommercial = compType === 'building_with_land';
  const isResidential = compType === 'residential';
  const isLand = compType === 'land_only';
  const isSale = checkType === 'salesCheckbox';

  const handleCardClick = (comp: IComp) => {
    onView(comp.id);
  };

  const handleEditClick = (e: React.MouseEvent, comp: IComp) => {
    e.stopPropagation();
    onEdit(comp.id);
  };

  const handleDeleteClick = (e: React.MouseEvent, comp: IComp) => {
    e.stopPropagation();
    onDelete(comp.id);
  };

  const getPropertyIcon = () => {
    if (isResidential) return <Home fontSize="small" />;
    if (isLand) return <Terrain fontSize="small" />;
    return <Business fontSize="small" />;
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden animate-pulse"
            style={{
              borderRadius: borderRadius.lg,
              boxShadow: shadows.md,
            }}
          >
            <div className="w-full h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-gray-400 mb-4">
          {getPropertyIcon()}
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Comps Found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
      variants={cardContainer}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {comps.map((comp) => {
          const imageUrl = getImageUrl(comp.property_image, NoImageUpload);
          const statusColor = getStatusColor(comp.comp_status);
          const statusLabel = getStatusLabel(compType, comp.comp_status);
          const propertyTypeColor = getPropertyTypeColor(comp.building_type);
          const isHovered = hoveredCard === comp.id;

          return (
            <motion.div
              key={comp.id}
              variants={cardItem}
              initial="rest"
              whileHover="hover"
              onHoverStart={() => setHoveredCard(comp.id)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => handleCardClick(comp)}
              className="bg-white rounded-lg overflow-hidden cursor-pointer relative group"
              style={{
                borderRadius: borderRadius.lg,
                boxShadow: shadows.md,
              }}
              layoutId={`comp-card-${comp.id}`}
            >
              {/* Image Section with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={imageUrl}
                  alt={comp.street_address || 'Property'}
                  className="w-full h-full object-cover"
                  variants={cardHover}
                  loading="lazy"
                  onError={(e: any) => {
                    e.target.src = NoImageUpload;
                  }}
                />

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                />

                {/* Status Badge */}
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{
                    backgroundColor: statusColor,
                    borderRadius: borderRadius.full,
                  }}
                >
                  {statusLabel}
                </div>

                {/* Property Type Icon */}
                <div
                  className="absolute bottom-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{
                    backgroundColor: propertyTypeColor,
                  }}
                >
                  {getPropertyIcon()}
                </div>

                {/* Quick Actions (show on hover) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-3 left-3 flex gap-2"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(comp.id);
                        }}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
                        aria-label="View details"
                        style={{ color: colors.primary }}
                      >
                        <Visibility fontSize="small" />
                      </button>
                      <button
                        onClick={handleEditClick as any}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Edit comp"
                        style={{ color: colors.navy }}
                      >
                        <Edit fontSize="small" />
                      </button>
                      <button
                        onClick={handleDeleteClick as any}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Delete comp"
                        style={{ color: colors.error }}
                      >
                        <Delete fontSize="small" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content Section */}
              <div className="p-4">
                {/* Address */}
                <h3
                  className="font-semibold text-base mb-1 line-clamp-2"
                  style={{ color: colors.text }}
                  title={comp.street_address || 'N/A'}
                >
                  {truncateText(comp.street_address, 45) || 'N/A'}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm mb-3" style={{ color: colors.textLight }}>
                  <LocationOn sx={{ fontSize: 16 }} />
                  <span>
                    {comp.city ? `${comp.city}, ` : ''}
                    {comp.state ? comp.state.toUpperCase() : 'N/A'}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="space-y-2">
                  {/* Price */}
                  {isSale && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.textLight }}>
                        {isCommercial ? 'Sale Price' : 'Price'}
                      </span>
                      <span className="font-bold text-lg" style={{ color: colors.primary }}>
                        {formatCurrency(comp.sale_price, 0)}
                      </span>
                    </div>
                  )}

                  {!isSale && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.textLight }}>
                        Lease Rate
                      </span>
                      <span className="font-bold text-lg" style={{ color: colors.primary }}>
                        {formatCurrency(comp.lease_rate, 2)}
                      </span>
                    </div>
                  )}

                  {/* Commercial Metrics */}
                  {isCommercial && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Price/SF</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatCurrency(comp.price_square_foot, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Building SF</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatSquareFeet(comp.building_square_footage)}
                        </span>
                      </div>
                      {comp.cap_rate && (
                        <div className="flex justify-between items-center text-sm">
                          <span style={{ color: colors.textLight }}>Cap Rate</span>
                          <span className="font-semibold" style={{ color: colors.text }}>
                            {formatPercent(comp.cap_rate)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Residential Metrics */}
                  {isResidential && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Beds/Baths</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {comp.total_beds || 0} / {comp.total_baths || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Square Feet</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatSquareFeet(comp.building_square_footage)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Price/SF</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatCurrency(comp.price_square_foot, 2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Land Metrics */}
                  {isLand && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Acreage</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatAcres(comp.land_acreage)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textLight }}>Price/Acre</span>
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatCurrency(comp.price_acre, 0)}
                        </span>
                      </div>
                      {comp.zoning && (
                        <div className="flex justify-between items-center text-sm">
                          <span style={{ color: colors.textLight }}>Zoning</span>
                          <span className="font-semibold text-xs" style={{ color: colors.text }}>
                            {truncateText(comp.zoning, 15)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs pt-2 border-t" style={{ color: colors.textMuted }}>
                    <CalendarToday sx={{ fontSize: 14 }} />
                    <span>{formatDate(comp.date_sold)}</span>
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: isHovered ? shadows.xl : 'none',
                  borderRadius: borderRadius.lg,
                }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompsCardsView;


















