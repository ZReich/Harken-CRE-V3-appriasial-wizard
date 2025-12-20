import ErrorBoundary from '@/components/error/ErrorBoundary';
import AccessibleTable from '@/pages/account';
import { MyAcoount } from '@/pages/account/contact-details/MyAccount';
import { Appraisal } from '@/pages/appraisal';
import CreateCostImprovement from '@/pages/appraisal/cost-improvement/CreateCostImprovement';
import ExhibitsListing from '@/pages/appraisal/Exhibits/listing';
import CreatIncomeApproch from '@/pages/appraisal/Income-Approch/create-income-approch';
import MapHeaderOptionsAppraisal from '@/pages/appraisal/Listing/menu-options';
import AreaInfo from '@/pages/appraisal/overview/area-info';
import LeaseApproach from '@/pages/appraisal/overview/lease/lease-approach';
import LeaseApproachForm from '@/pages/appraisal/overview/lease/leaseApproachForm';
import MapBoundary from '@/pages/appraisal/overview/map-Boundary';
import { Overview } from '@/pages/appraisal/overview/Overview';
import AppraisalReport from '@/pages/appraisal/Report/report';
import SalesApproach from '@/pages/appraisal/sales/sales-approach';
import SalesApproachForm from '@/pages/appraisal/sales/salesApproachForm';
import ClientForm from '@/pages/appraisal/set-up/create-client';
import { Setup } from '@/pages/appraisal/set-up/Setup';
import { UpdatedSetup } from '@/pages/appraisal/set-up/updated-setup';
import { CommercialCompsView } from '@/pages/comps/comps-view/CommercialCompsView';
import CreateComp from '@/pages/comps/create-comp/CreateComp';
import MapHeaderOptions from '@/pages/comps/Listing/menu-options';
import UpdateComp from '@/pages/comps/Update-comps/UpdateComp';
import ForgotPassword from '@/pages/forgot-password';
import LoginForm from '@/pages/login';
import { AuthProvider } from '@/pages/login/AuthProvider';
import { MyProfile } from '@/pages/my-profile/profile-details/MyProfile';
import MainScreen from '@/pages/Report/main-screen-template';
import TemplateListingTable from '@/pages/Report/template-list';
import ResetPassword from '@/pages/reset-password';
import ResidentialCreateComp from '@/pages/residential/create-comp/CreateComp';
import ResidentailMapHeaderOptions from '@/pages/residential/Listing/menu-options';
import { ResCompsView } from '@/pages/residential/residential-comp-view/ResCompsView';
import ResidentialUpdateComp from '@/pages/residential/update-comps/UpdateComp';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import GoogleMapAreaInfo from '../pages/appraisal/overview/Area-info-map/area-info-map';
import GoogleMapAreaInfoCost from '../pages/appraisal/overview/cost/costCompsMap';
import MainScreenAppraisal from '../pages/appraisal/Report/main-screen';
import GoogleMapAreaInfoSales from '../pages/appraisal/sales/salesCompsMap';
import PrivateRoute from './PrivateRoute';
// import { CostImprovement } from '@/pages/appraisal/cost-improvement/CostImprovement';
import CostApproach from '@/pages/appraisal/overview/cost/cost-approach';
import CostApproachForm from '@/pages/appraisal/overview/cost/CostApproachForm';
import ApproachResidential from '@/pages/appraisal/residential';
// import EvalutionPhotoSheet from '@/pages/appraisal/overview/appraisal-photo-sheet/EvalutionPhotoSheet';
import RentRollSidebar from '@/pages/appraisal/Income-Approch/rent-roll-sidebar';
import MapHeaderOptionsLandOnlyAppraisal from '@/pages/appraisal/Listing/menu-land-only-options';
import AppraisalPhotoSheet from '@/pages/appraisal/overview/appraisal-photo-sheet/AppraisalPhotoSheet';
import CostCompsApproachForm from '@/pages/appraisal/overview/cost/Cost-comps-approach-form';
import SuperSimple from '@/pages/appraisal/overview/DragDrop';
import LeaseCompsApproachForm from '@/pages/appraisal/overview/lease/leaseCompsApproachForm';
import GoogleMapAreaInfoLease from '@/pages/appraisal/overview/lease/leaseCompsMap';
import CompsApproachForm from '@/pages/appraisal/sales/CompsApproachForm';
import EditClientForm from '@/pages/appraisal/set-up/edit-client';
import ClientListingTable from '@/pages/client';
import MapHeaderLandOptions from '@/pages/comps/Listing/menu-land-option';
import EvaluationAerialInfoMap from '@/pages/evaluation/evaluation-area-info-map/aerial-info-map';
import EvaluationCapApproach from '@/pages/evaluation/evaluation-cap-rate-approach/evaluation-cap-approach';
import EvaluationCapCompsApproach from '@/pages/evaluation/evaluation-cap-rate-approach/evaluation-cap-approach-comps-form';
import EvaluationGoogleMapAreaInfoCap from '@/pages/evaluation/evaluation-cap-rate-approach/evaluation-cap-approach-comps-map';
import EvaluationCapApproachForm from '@/pages/evaluation/evaluation-cap-rate-approach/evaluation-cap-approach-form';
import EvaluationCostApproach from '@/pages/evaluation/evaluation-cost-approach/evaluation-cost-approach';
import EvaluationCostApproachCompsForm from '@/pages/evaluation/evaluation-cost-approach/evaluation-cost-approach-comps-form';
import EvaluationCostApproachSubjectPropertyForm from '@/pages/evaluation/evaluation-cost-approach/evaluation-cost-approach-subject-property-form';
import EvaluationGoogleMapAreaInfoCost from '@/pages/evaluation/evaluation-cost-approach/evaluation-cost-comps-location';
import EvaluationCreateCostImprovement from '@/pages/evaluation/evaluation-cost-approach/evaluation-cost-improvement/evaluation-create-cost-improvement';
import EvaluationExhibitsListing from '@/pages/evaluation/evaluation-exhibits/evaluation-exhibits-listing';
import EvaluationCreatIncomeApproch from '@/pages/evaluation/evaluation-income-approach/create-income-approach-evaluation';
import EvaluationRentRoleSidebar from '@/pages/evaluation/evaluation-income-approach/evaluation-rent-roll-sidebatr';
import EvaluationLeaseApproachAiCompsForm from '@/pages/evaluation/evaluation-lease-approach/evaluation-lease-ai-comps-form';
import EvaluationLeaseApproach from '@/pages/evaluation/evaluation-lease-approach/evaluation-lease-approach';
import EvaluationCompsGoogleMapAreaInfoLease from '@/pages/evaluation/evaluation-lease-approach/evaluation-lease-comps-map';
import EvaluationLeaseApproachForm from '@/pages/evaluation/evaluation-lease-approach/evaluatuion-lease-approach-form';
import EvaluationMultiFamilyApproach from '@/pages/evaluation/evaluation-multi-family-approach/evaluation-multi-family-approach';
import EvaluationMultiFamilyApproachCompsForm from '@/pages/evaluation/evaluation-multi-family-approach/evaluation-multi-family-approach-comps-form';
import EvaluationMultiFamilyApproachSubjectPropertyForm from '@/pages/evaluation/evaluation-multi-family-approach/evaluation-multi-family-approach-subject-property-form';
import EvaluationGoogleMapAreaInfoMultiFamily from '@/pages/evaluation/evaluation-multi-family-approach/evaluation-multi-family-comps-location';
import EvaluationReview from '@/pages/evaluation/evaluation-review/evaluation-review';
import EvaluationReport from '@/pages/evaluation/report';
import HeaderOptionsEvaluation from '@/pages/evaluation/listing/evaluation-menu-option';
import HeaderOptionsLandOnlyAppraisal from '@/pages/evaluation/listing/evaluation-menu-option-land-only';
import EvaluationAreaInfo from '@/pages/evaluation/overview/evaluation-area-info';
import EvaluationImage from '@/pages/evaluation/overview/evaluation-image';
import EvalouationMapBoundary from '@/pages/evaluation/overview/evaluation-map-boundary';
import EvaluationPhotoSheet from '@/pages/evaluation/overview/evaluation-photo-sheet';
import { EvaluationOverview } from '@/pages/evaluation/overview/overview';
import ResidentialEvaluationAerialInfoMap from '@/pages/evaluation/residential/residential-area-info-map/aerial-info-map';
import ResidentialCostApproach from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-approach';
import ResidentialCostApproachCompsForm from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-approach-comps-form';
import ResidentialCostApproachSubjectPropertyForm from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-approach-subject-property-form';
// import ResidentialGoogleMapAreaInfoCost from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-comp-location';
// import ResidentialCreateCostImprovement from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-improvement/residential-create-cost-improvement';
import ResidentialExhibitsListing from '@/pages/evaluation/residential/residential-exhibits/residential-exhibits-listing';
import ResidentialEvaluationCreatIncomeApproch from '@/pages/evaluation/residential/residential-income-approach/create-income-approach-residential-evaluation';
import HeaderOptionsResidential from '@/pages/evaluation/residential/residential-listing/residential-menu-option';
import ResidentialAreaInfo from '@/pages/evaluation/residential/residential-overview/residential-area-info';
import ResidentialImage from '@/pages/evaluation/residential/residential-overview/residential-image';
import ResidentialEvalouationMapBoundary from '@/pages/evaluation/residential/residential-overview/residential-map-boundary';
import { ResidentialOverview } from '@/pages/evaluation/residential/residential-overview/residential-overview';
import ResidentialEvaluationPhotoSheet from '@/pages/evaluation/residential/residential-overview/residential-photo-sheet';
import EvaluationSalesApproach from '@/pages/evaluation/sales-approach/evaluation-sales-approach';
import EvaluationSalesCompsApproach from '@/pages/evaluation/sales-approach/evaluation-sales-approach-comps-form';
import EvaluationGoogleMapAreaInfoSales from '@/pages/evaluation/sales-approach/evaluation-sales-approach-comps-map';
import EvaluationSalesApproachForm from '@/pages/evaluation/sales-approach/evaluation-sales-approach-form';
import { EvaluationSetup } from '@/pages/evaluation/set-up/evaluation-setup';
import { UpdatedEvaluationSetup } from '@/pages/evaluation/set-up/evaluation-update-setup';
import { ResidentialSetup } from '@/pages/evaluation/set-up/residential-setup';
import { UpdatedResidentialSetup } from '@/pages/evaluation/set-up/residential-update-setup';
import ResidentialGoogleMapAreaInfoCost from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-comp-location';
import ResidentialCreateCostImprovement from '@/pages/evaluation/residential/residential-cost-approach/residential-cost-improvement/residential-create-cost-improvement';
import ResidentialSalesApproachForm from '@/pages/evaluation/residential/residential-sales-approach/residential-sales-approach-form';
import ResidentialSalesCompsApproach from '@/pages/evaluation/residential/residential-sales-approach/residential-sales-approach-comps-form';
import ResidentialSalesApproach from '@/pages/evaluation/residential/residential-sales-approach/residential-sales-approach';
import ResidentialReview from '@/pages/evaluation/residential/residential-review/residential-review';
import ResidentialGoogleMapAreaInfoSales from '@/pages/evaluation/residential/residential-sales-approach/residential-sales-approach-comps-map';
import ReportRoute from './report-routing';
import ResidentialEvaluationReport from '@/pages/evaluation/report/residential-report';
const RoutesApp = () => {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/login/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password/:id" element={<ResetPassword />} />
            <Route
              path="/create-comps"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />

            <Route
              path="/evaluation/cost/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/lease/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cap/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/multi-family/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/cost/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/lease/create-comp"
              element={
                <PrivateRoute>
                  <CreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/sales/create-comp"
              element={
                <PrivateRoute>
                  <ResidentialCreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/cost/create-comp"
              element={
                <PrivateRoute>
                  <ResidentialCreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales-approach"
              element={
                <PrivateRoute>
                  <SalesApproachForm />
                </PrivateRoute>
              }
            />

            <Route
              path="/evaluation/review"
              element={
                <PrivateRoute>
                  <EvaluationReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation/review"
              element={
                <PrivateRoute>
                  <ResidentialReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales-approach"
              element={
                <PrivateRoute>
                  <EvaluationSalesApproachForm />
                </PrivateRoute>
              }
            />

            <Route
              path="/residential/sales-approach"
              element={
                <PrivateRoute>
                  <ResidentialSalesApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cap-approach"
              element={
                <PrivateRoute>
                  <EvaluationCapApproachForm />
                </PrivateRoute>
              }
            />
            {/* <Route
            path="/evaluation/filter-multi-family-comps"
            element={
              <PrivateRoute>
                <EvaluationMultiFamilyApproachCompsForm />
              </PrivateRoute>
            }
          /> */}
            <Route
              path="/evaluation/multi-family-approach"
              element={
                <PrivateRoute>
                  <EvaluationMultiFamilyApproachSubjectPropertyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cost-approach"
              element={
                <PrivateRoute>
                  <EvaluationCostApproachSubjectPropertyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/lease-approach"
              element={
                <PrivateRoute>
                  <EvaluationLeaseApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/rent-roll"
              element={
                <PrivateRoute>
                  <RentRollSidebar />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/rent-roll"
              element={
                <PrivateRoute>
                  <EvaluationRentRoleSidebar />
                </PrivateRoute>
              }
            />
            <Route
              path=":salesId"
              element={
                <PrivateRoute>
                  <EvaluationSalesApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":salesId"
              element={
                <PrivateRoute>
                  <ResidentialSalesApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":leaseId"
              element={
                <PrivateRoute>
                  <EvaluationLeaseApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":costsId"
              element={
                <PrivateRoute>
                  <EvaluationCostApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":costsId"
              element={
                <PrivateRoute>
                  <ResidentialCostApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":capId"
              element={
                <PrivateRoute>
                  <EvaluationCapApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":evaluationId"
              element={
                <PrivateRoute>
                  <EvaluationMultiFamilyApproach />
                </PrivateRoute>
              }
            />
            <Route
              path=":salesId"
              element={
                <PrivateRoute>
                  <SalesApproach />
                </PrivateRoute>
              }
            />
            <Route
              path="/lease-approach"
              element={
                <PrivateRoute>
                  <LeaseApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path=":leaseId"
              element={
                <PrivateRoute>
                  <LeaseApproach />
                </PrivateRoute>
              }
            />
            <Route
              path="/cost-approach"
              element={
                <PrivateRoute>
                  <CostApproachForm />
                </PrivateRoute>
              }
            >
              <Route
                path=":costId"
                element={
                  <PrivateRoute>
                    <CostApproach />
                  </PrivateRoute>
                }
              />
            </Route>
            <Route
              path="/residential-create-comps"
              element={
                <PrivateRoute>
                  <ResidentialCreateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/property-boundaries"
              element={
                <PrivateRoute>
                  <MapBoundary />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-property-boundaries"
              element={
                <PrivateRoute>
                  <EvalouationMapBoundary />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation-property-boundaries"
              element={
                <PrivateRoute>
                  <ResidentialEvalouationMapBoundary />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/images"
              element={
                <PrivateRoute>
                  <EvaluationImage />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation/images"
              element={
                <PrivateRoute>
                  <ResidentialImage />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-photo-sheet"
              element={
                <PrivateRoute>
                  <AppraisalPhotoSheet />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-photo-sheet"
              element={
                <PrivateRoute>
                  <EvaluationPhotoSheet />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation-photo-sheet"
              element={
                <PrivateRoute>
                  <ResidentialEvaluationPhotoSheet />
                </PrivateRoute>
              }
            />
            <Route
              path="/evalution-drag-drop"
              element={
                <PrivateRoute>
                  <SuperSimple />
                </PrivateRoute>
              }
            />
            <Route
              path="/aerialmap"
              element={
                <PrivateRoute>
                  <GoogleMapAreaInfo GoogleData={[]} />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-aerialmap"
              element={
                <PrivateRoute>
                  <EvaluationAerialInfoMap GoogleData={[]} />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation-aerialmap"
              element={
                <PrivateRoute>
                  <ResidentialEvaluationAerialInfoMap GoogleData={[]} />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales-comps-map"
              element={
                <PrivateRoute>
                  <GoogleMapAreaInfoSales />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales-comps-map"
              element={
                <PrivateRoute>
                  <EvaluationGoogleMapAreaInfoSales />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation/sales-comps-map"
              element={
                <PrivateRoute>
                  <ResidentialGoogleMapAreaInfoSales />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/sales-comps-map"
              element={
                <PrivateRoute>
                  <ResidentialGoogleMapAreaInfoSales />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/multi-family-comps-map"
              element={
                <PrivateRoute>
                  <EvaluationGoogleMapAreaInfoMultiFamily />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cap-comps-map"
              element={
                <PrivateRoute>
                  <EvaluationGoogleMapAreaInfoCap />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/lease-comps-map"
              element={
                <PrivateRoute>
                  <EvaluationCompsGoogleMapAreaInfoLease />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cost-comps-map"
              element={
                <PrivateRoute>
                  <EvaluationGoogleMapAreaInfoCost />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation/cost-comps-map"
              element={
                <PrivateRoute>
                  <ResidentialGoogleMapAreaInfoCost />
                </PrivateRoute>
              }
            />
            <Route
              path=":saleMapId"
              element={
                <PrivateRoute>
                  <GoogleMapAreaInfoSales />
                </PrivateRoute>
              }
            />
            <Route
              path="/lease-comps-map"
              element={
                <PrivateRoute>
                  <GoogleMapAreaInfoLease />
                </PrivateRoute>
              }
            >
              <Route
                path=":leaseMapId"
                element={
                  <PrivateRoute>
                    <GoogleMapAreaInfoLease />
                  </PrivateRoute>
                }
              />
            </Route>
            <Route
              path="/cost-comps-map"
              element={
                <PrivateRoute>
                  <GoogleMapAreaInfoCost />
                </PrivateRoute>
              }
            >
              <Route
                path=":costMapId"
                element={
                  <PrivateRoute>
                    <GoogleMapAreaInfoCost />
                  </PrivateRoute>
                }
              />
              <Route
                path=":costMapId"
                element={
                  <PrivateRoute>
                    <EvaluationGoogleMapAreaInfoCost />
                  </PrivateRoute>
                }
              />
            </Route>
            <Route
              path="/area-info/:id"
              element={
                <PrivateRoute>
                  <AreaInfo />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-area-info"
              element={
                <PrivateRoute>
                  <EvaluationAreaInfo />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/report/:id"
              element={
                <ReportRoute>
                  <EvaluationReport />
                </ReportRoute>
              }
            />
            <Route
              path="/residential/report/:id"
              element={
                <ReportRoute>
                  <ResidentialEvaluationReport />
                </ReportRoute>
              }
            />
            <Route
              path="/residential/evaluation-area-info"
              element={
                <PrivateRoute>
                  <ResidentialAreaInfo />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential-update-comps/:id"
              element={
                <PrivateRoute>
                  <ResidentialUpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps"
              element={
                <PrivateRoute>
                  <MapHeaderOptions />
                </PrivateRoute>
              }
            />
            <Route
              path="/filter-comps"
              element={
                <PrivateRoute>
                  <CompsApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/filter-comps"
              element={
                <PrivateRoute>
                  <EvaluationSalesCompsApproach />
                </PrivateRoute>
              }
            />

            <Route
              path="/residential/filter-sales-comps"
              element={
                <PrivateRoute>
                  <ResidentialSalesCompsApproach />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/filter-cost-comps"
              element={
                <PrivateRoute>
                  <EvaluationCostApproachCompsForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/filter-cost-comps"
              element={
                <PrivateRoute>
                  <ResidentialCostApproachCompsForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/filter-lease-comps"
              element={
                <PrivateRoute>
                  <EvaluationLeaseApproachAiCompsForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/filter-cap-comps"
              element={
                <PrivateRoute>
                  <EvaluationCapCompsApproach />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/filter-multi-family-comps"
              element={
                <PrivateRoute>
                  <EvaluationMultiFamilyApproachCompsForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/filter-cost-comps"
              element={
                <PrivateRoute>
                  <CostCompsApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/filter-lease-comps"
              element={
                <PrivateRoute>
                  <LeaseCompsApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/land_comps"
              element={
                <PrivateRoute>
                  <MapHeaderLandOptions />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/edit/:id"
              element={
                <PrivateRoute>
                  <MyProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/account-edit/:id"
              element={
                <PrivateRoute>
                  <MyAcoount />
                </PrivateRoute>
              }
            />
            <Route
              path="/client-edit/:id"
              element={
                <PrivateRoute>
                  <EditClientForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/accounts/create"
              element={
                <PrivateRoute>
                  <MyAcoount />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <PrivateRoute>
                  <AccessibleTable />
                </PrivateRoute>
              }
            />
            <Route
              path="/clients-list"
              element={
                <PrivateRoute>
                  <ClientListingTable />
                </PrivateRoute>
              }
            />
            <Route
              path="/res_comps"
              element={
                <PrivateRoute>
                  <ResidentailMapHeaderOptions />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-comps/:id"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/update-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/evaluation/update-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/evaluation/update-cost-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/evaluation/update-lease-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/evaluation/update-cap-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/residential/update-sales-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <ResidentialUpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/residential/update-lease-approach/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <ResidentialUpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/residential/evaluation/update-cost-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <ResidentialUpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-comps/:id/:appraisalId/:type/:salesId"
              path="/evaluation/update-multi-family-comps/:id/:appraisalId/:type/:compId"
              element={
                <PrivateRoute>
                  <UpdateComp />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/cost-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/lease-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales-comps-view/:id"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/sales-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <ResCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/cost-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <ResCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cost-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/lease-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/multi-family-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cap-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />

            <Route
              path="/comps-view/lease-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/sales-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/evaluation/sales-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/evaluation/cap-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/evaluation/multi-family-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/evaluation/lease-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/evaluation/cost-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/comps-view/cost-approach/:id/:check"
              element={
                <PrivateRoute>
                  <CommercialCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/res-comps-view/:id/:check"
              element={
                <PrivateRoute>
                  <ResCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/res-comps-view/:id"
              element={
                <PrivateRoute>
                  <ResCompsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-list"
              element={
                <PrivateRoute>
                  <MapHeaderOptionsAppraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-list"
              element={
                <PrivateRoute>
                  <HeaderOptionsEvaluation />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/residential-list"
              element={
                <PrivateRoute>
                  <HeaderOptionsResidential />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-list-land-only"
              element={
                <PrivateRoute>
                  <MapHeaderOptionsLandOnlyAppraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-list-land-only"
              element={
                <PrivateRoute>
                  <HeaderOptionsLandOnlyAppraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-set-up"
              element={
                <PrivateRoute>
                  <Setup />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-set-up"
              element={
                <PrivateRoute>
                  <EvaluationSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/residential-set-up"
              element={
                <PrivateRoute>
                  <ResidentialSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/overview"
              element={
                <PrivateRoute>
                  <Overview />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-overview"
              element={
                <PrivateRoute>
                  <EvaluationOverview />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential-overview"
              element={
                <PrivateRoute>
                  <ResidentialOverview />
                </PrivateRoute>
              }
            />
            <Route
              // path="/income-approch/:id"
              path="/income-approch"
              element={
                <PrivateRoute>
                  <CreatIncomeApproch />
                </PrivateRoute>
              }
            />
            <Route
              // path="/income-approch/:id"
              path="/evaluation/income-approch"
              element={
                <PrivateRoute>
                  <EvaluationCreatIncomeApproch />
                </PrivateRoute>
              }
            />
            <Route
              // path="/income-approch/:id"
              path="/residential/evaluation/income-approch"
              element={
                <PrivateRoute>
                  <ResidentialEvaluationCreatIncomeApproch />
                </PrivateRoute>
              }
            />

            <Route
              path="/sales-approch"
              element={
                <PrivateRoute>
                  <SalesApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales-approach"
              element={
                <PrivateRoute>
                  <EvaluationSalesApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cap-approach"
              element={
                <PrivateRoute>
                  <EvaluationCapApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/multi-family-approach"
              element={
                <PrivateRoute>
                  <EvaluationMultiFamilyApproachSubjectPropertyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cost-approach"
              element={
                <PrivateRoute>
                  <EvaluationCostApproachSubjectPropertyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation/cost-approach"
              element={
                <PrivateRoute>
                  <ResidentialCostApproachSubjectPropertyForm />
                </PrivateRoute>
              }
            />

            <Route
              path="/lease-approch"
              element={
                <PrivateRoute>
                  <LeaseApproachForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-exhibits"
              element={
                <PrivateRoute>
                  <ExhibitsListing />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation-exhibits"
              element={
                <PrivateRoute>
                  <EvaluationExhibitsListing />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation-exhibits"
              element={
                <PrivateRoute>
                  <ResidentialExhibitsListing />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-appraisal-set-up/:id"
              path="/update-appraisal-set-up"
              element={
                <PrivateRoute>
                  <UpdatedSetup />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-appraisal-set-up/:id"
              path="/update-evaluation/residential-set-up"
              element={
                <PrivateRoute>
                  <UpdatedResidentialSetup />
                </PrivateRoute>
              }
            />
            <Route
              // path="/update-appraisal-set-up/:id"
              path="/update-evaluation-set-up"
              element={
                <PrivateRoute>
                  <UpdatedEvaluationSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-client"
              element={
                <PrivateRoute>
                  <ClientForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-new-client"
              element={
                <PrivateRoute>
                  <ClientForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/template-list"
              element={
                <PrivateRoute>
                  <TemplateListingTable />
                </PrivateRoute>
              }
            />
            <Route
              path="/template/:template_id"
              element={
                <PrivateRoute>
                  <MainScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/report"
              element={
                <PrivateRoute>
                  <AppraisalReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/report/:id"
              element={
                <PrivateRoute>
                  <EvaluationReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-list"
              element={
                <PrivateRoute>
                  <MapHeaderOptionsAppraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-set-up"
              element={
                <PrivateRoute>
                  <Setup />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-appraisal-set-up"
              element={
                <PrivateRoute>
                  <UpdatedSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/overview"
              element={
                <PrivateRoute>
                  <Overview />
                </PrivateRoute>
              }
            />
            <Route
              path="/income-approch"
              element={
                <PrivateRoute>
                  <CreatIncomeApproch />
                </PrivateRoute>
              }
            />
            <Route
              path="/appraisal-exhibits"
              element={
                <PrivateRoute>
                  <ExhibitsListing />
                </PrivateRoute>
              }
            >
              <Route
                path=":exhibitsId"
                element={
                  <PrivateRoute>
                    <ExhibitsListing />
                  </PrivateRoute>
                }
              />
            </Route>
            <Route
              path="/area-info"
              element={
                <PrivateRoute>
                  <AreaInfo />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales-approch"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/sales-approch"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cap-approch"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/multi-family-approch"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cost-approch"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/lease-approch"
              element={
                <PrivateRoute>
                  <Appraisal />
                </PrivateRoute>
              }
            />
            <Route
              path="/cost-approach-improvement"
              element={
                <PrivateRoute>
                  <CreateCostImprovement />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluation/cost-approach-improvement"
              element={
                <PrivateRoute>
                  <EvaluationCreateCostImprovement />
                </PrivateRoute>
              }
            />
            <Route
              path="/residential/evaluation/cost-approach-improvement"
              element={
                <PrivateRoute>
                  <ResidentialCreateCostImprovement />
                </PrivateRoute>
              }
            />
            <Route
              path="/approach-residential"
              element={
                <PrivateRoute>
                  <ApproachResidential />
                </PrivateRoute>
              }
            />
            <Route
              path="/report-template"
              element={
                <PrivateRoute>
                  <MainScreenAppraisal />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default RoutesApp;
