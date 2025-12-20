import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  IconButton,
  Breadcrumbs,
  Link,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Print,
  Share,
  LocationOn,
  CalendarToday,
  Business,
  AttachMoney,
  SquareFoot,
  TrendingUp,
  Home,
  ContentCopy,
} from '@mui/icons-material';
import { CompsViewGetData } from '@/components/interface/comps-view-get-data-type';
import { useGet } from '@/hook/useGet';
import CompViewGoogleMapLocation from './comp-map';
import { compsView } from './compsViewEnum';
import { CompanyGetData } from '@/components/interface/company-get-data-type';
import { ClientGetData } from '@/components/interface/client-get-data-type';
import loadingImage from '../../../images/loading.png';
import NoImageUpload from '../../../images/Group 1549.png';
import { formatDateToMMDDYYYY } from '@/utils/date-format';
import { ListingEnum } from '../enum/CompsEnum';
import { colors, borderRadius, shadows } from '@/utils/design-tokens';
import { pageTransition, fade, scaleIn } from '@/utils/animations';
import {
  formatCurrency,
  formatSquareFeet,
  formatPercent,
  formatNumber,
  getPropertyTypeColor,
  getStatusColor,
  getStatusLabel,
  getImageUrl,
} from '@/utils/comps-helpers';

export const CommercialCompsViewRedesigned = () => {
  const navigate = useNavigate();
  const { id, check }: any = useParams();
  const location = useLocation();
  const propertyId = location.state?.propertyId;
  const approachId = location.state?.approachId;
  const comparisonBasis = location.state?.comparisonBasis;
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      localStorage.setItem('checkStatus', check);
      if (localStorage.getItem('activeType') === 'building_with_land') {
        navigate('/comps');
      } else {
        navigate('/land_comps');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [check, navigate]);

  const { data, isLoading } = useGet<CompsViewGetData>({
    queryKey: 'all',
    endPoint: `comps/get/${id}`,
    config: { refetchOnWindowFocus: false },
  });

  const view = data?.data?.data;

  const { data: companyData } = useGet<CompanyGetData>({
    queryKey: `company/get/${view?.offeror_id}`,
    endPoint: `company/get/${view?.offeror_id}`,
    config: {
      enabled: Boolean(
        view?.offeror_id !== null && view?.offeror_type === compsView.COMPANY
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: companyData1 } = useGet<CompanyGetData>({
    queryKey: `company/get/${view?.acquirer_id}`,
    endPoint: `company/get/${view?.acquirer_id}`,
    config: {
      enabled: Boolean(
        view?.acquirer_id !== null && view?.acquirer_type === compsView.COMPANY
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: clientData } = useGet<ClientGetData>({
    queryKey: `client/get/${view?.offeror_id}`,
    endPoint: `client/get/${view?.offeror_id}`,
    config: {
      enabled: Boolean(
        view?.offeror_id !== null && view?.offeror_type === compsView.PERSON
      ),
      refetchOnWindowFocus: false,
    },
  });

  const { data: clientData1 } = useGet<ClientGetData>({
    queryKey: `client/get1/${view?.acquirer_id}`,
    endPoint: `client/get/${view?.acquirer_id}`,
    config: {
      enabled: Boolean(
        view?.acquirer_id !== null && view?.acquirer_type === compsView.PERSON
      ),
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/update-comps/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: view?.street_address || 'Property',
        text: `Check out this property: ${view?.street_address}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img src={loadingImage} alt="Loading..." className="w-16 h-16" />
      </div>
    );
  }

  if (!view) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
            Comp Not Found
          </h2>
          <button
            onClick={handleBack}
            className="px-6 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: colors.primary }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(view.property_image, NoImageUpload);
  const statusColor = getStatusColor(view.comp_status);
  const statusLabel = getStatusLabel('commercial', view.comp_status);
  const propertyTypeColor = getPropertyTypeColor(view.building_type);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Breadcrumb and Actions Header */}
      <Box
        className="sticky top-0 z-40 py-4 px-6"
        style={{
          backgroundColor: 'white',
          boxShadow: shadows.md,
        }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <IconButton onClick={handleBack} sx={{ color: colors.navy }}>
              <ArrowBack />
            </IconButton>
            <Breadcrumbs>
              <Link
                href="/comps"
                underline="hover"
                sx={{ color: colors.textLight, '&:hover': { color: colors.primary } }}
              >
                Comps
              </Link>
              <span style={{ color: colors.text, fontWeight: 600 }}>
                {view.street_address || 'Property Details'}
              </span>
            </Breadcrumbs>
          </div>
          <div className="flex gap-2">
            <Tooltip title="Edit">
              <IconButton
                onClick={handleEdit}
                sx={{
                  color: colors.navy,
                  '&:hover': { backgroundColor: `${colors.navy}10` },
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton
                onClick={handlePrint}
                sx={{
                  color: colors.textLight,
                  '&:hover': { backgroundColor: `${colors.textLight}10` },
                }}
              >
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton
                onClick={handleShare}
                sx={{
                  color: colors.textLight,
                  '&:hover': { backgroundColor: `${colors.textLight}10` },
                }}
              >
                <Share />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </Box>

      {/* Hero Section */}
      <motion.div
        className="relative h-96 overflow-hidden"
        variants={fade}
      >
        <img
          src={imageUrl}
          alt={view.street_address || 'Property'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Status and Type Badges */}
        <div className="absolute top-6 right-6 flex gap-3">
          <Chip
            label={statusLabel}
            sx={{
              backgroundColor: statusColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
            }}
          />
          <Chip
            label={view.building_type || 'Commercial'}
            sx={{
              backgroundColor: propertyTypeColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
            }}
          />
        </div>

        {/* Property Title Overlay */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-3">
              {view.street_address || 'N/A'}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <LocationOn />
                <span>
                  {view.city ? `${view.city}, ` : ''}
                  {view.state ? view.state.toUpperCase() : ''}
                  {view.zipcode ? ` ${view.zipcode}` : ''}
                </span>
              </div>
              {view.date_sold && (
                <div className="flex items-center gap-2">
                  <CalendarToday />
                  <span>{formatDateToMMDDYYYY(view.date_sold)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Box className="max-w-7xl mx-auto px-6 py-8">
        <Grid container spacing={4}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            {/* Key Metrics Cards */}
            <motion.div
              variants={scaleIn}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              {check === 'sales' && (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: borderRadius.lg,
                    boxShadow: shadows.md,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2" style={{ color: colors.textLight }}>
                    <AttachMoney fontSize="small" />
                    <span className="text-xs font-semibold">Sale Price</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {formatCurrency(view.sale_price, 0)}
                  </div>
                </div>
              )}

              {check === 'lease' && (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: borderRadius.lg,
                    boxShadow: shadows.md,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2" style={{ color: colors.textLight }}>
                    <AttachMoney fontSize="small" />
                    <span className="text-xs font-semibold">Lease Rate</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {formatCurrency(view.lease_rate, 2)}
                  </div>
                </div>
              )}

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'white',
                  borderRadius: borderRadius.lg,
                  boxShadow: shadows.md,
                }}
              >
                <div className="flex items-center gap-2 mb-2" style={{ color: colors.textLight }}>
                  <SquareFoot fontSize="small" />
                  <span className="text-xs font-semibold">Building SF</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.text }}>
                  {formatSquareFeet(view.building_square_footage)}
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'white',
                  borderRadius: borderRadius.lg,
                  boxShadow: shadows.md,
                }}
              >
                <div className="flex items-center gap-2 mb-2" style={{ color: colors.textLight }}>
                  <AttachMoney fontSize="small" />
                  <span className="text-xs font-semibold">Price/SF</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(view.price_square_foot, 2)}
                </div>
              </div>

              {view.cap_rate && (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: borderRadius.lg,
                    boxShadow: shadows.md,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2" style={{ color: colors.textLight }}>
                    <TrendingUp fontSize="small" />
                    <span className="text-xs font-semibold">Cap Rate</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: colors.success }}>
                    {formatPercent(view.cap_rate)}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Property Details Section */}
            <motion.div
              variants={scaleIn}
              className="p-6 mb-6"
              style={{
                backgroundColor: 'white',
                borderRadius: borderRadius.lg,
                boxShadow: shadows.md,
              }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                <Business />
                Property Details
              </h2>
              <Grid container spacing={3}>
                {view.property_name && (
                  <Grid item xs={12} sm={6}>
                    <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                      Property Name
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {view.property_name}
                    </div>
                  </Grid>
                )}
                {view.building_type && (
                  <Grid item xs={12} sm={6}>
                    <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                      Building Type
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {view.building_type}
                    </div>
                  </Grid>
                )}
                {view.building_sub_type && (
                  <Grid item xs={12} sm={6}>
                    <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                      Building Subtype
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {view.building_sub_type}
                    </div>
                  </Grid>
                )}
                {view.year_built && (
                  <Grid item xs={12} sm={6}>
                    <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                      Year Built
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {view.year_built}
                    </div>
                  </Grid>
                )}
                {view.stories && (
                  <Grid item xs={12} sm={6}>
                    <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                      Stories
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {view.stories}
                    </div>
                  </Grid>
                )}
                {view.land_square_footage && (
                  <Grid item xs={12} sm={6}>
                    <div className="text-xs font-semibold mb-1" style={{ color: colors.textLight }}>
                      Land SF
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {formatSquareFeet(view.land_square_footage)}
                    </div>
                  </Grid>
                )}
              </Grid>
            </motion.div>

            {/* Map Section */}
            {view.latitude && view.longitude && (
              <motion.div
                variants={scaleIn}
                className="p-6 mb-6"
                style={{
                  backgroundColor: 'white',
                  borderRadius: borderRadius.lg,
                  boxShadow: shadows.md,
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <LocationOn />
                  Location
                </h2>
                <div className="h-96 rounded-lg overflow-hidden">
                  <CompViewGoogleMapLocation compViewData={view} />
                </div>
              </motion.div>
            )}
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Actions Card */}
            <motion.div
              variants={scaleIn}
              className="p-6 mb-6 sticky top-24"
              style={{
                backgroundColor: 'white',
                borderRadius: borderRadius.lg,
                boxShadow: shadows.md,
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                    borderRadius: borderRadius.md,
                  }}
                >
                  <Edit fontSize="small" />
                  Edit Comp
                </button>
                <button
                  onClick={() => copyToClipboard(view.street_address || '')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold border transition-colors"
                  style={{
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: borderRadius.md,
                  }}
                >
                  <ContentCopy fontSize="small" />
                  Copy Address
                </button>
              </div>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default CommercialCompsViewRedesigned;


















