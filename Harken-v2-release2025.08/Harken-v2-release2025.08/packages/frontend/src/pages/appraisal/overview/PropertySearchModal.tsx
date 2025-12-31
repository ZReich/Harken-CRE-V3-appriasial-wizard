import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Typography, List, ListItem, ListItemText, CircularProgress, Autocomplete } from '@mui/material';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import AutocompleteLocation from '@/pages/comps/create-comp/searchLocation';
import { usa_state } from '@/pages/comps/comp-form/fakeJson';

interface PropertySearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProperty?: (property: any) => void;
}

interface SearchFormValues {
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  apnNumber: string;
}

const validationSchema = Yup.object({
  streetAddress: Yup.string().required('Street address is required'),
  zipcode: Yup.string().required('Zipcode is required'),
  city: Yup.string(),
  state: Yup.string(),
  apnNumber: Yup.string(),
});

const PropertySearchModal: React.FC<PropertySearchModalProps> = ({ open, onClose, onSelectProperty }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const usaStateOptions = Object.entries(usa_state[0]).map(
    ([value, label]) => ({
      value,
      label,
    })
  );



  const searchProperties = async (values: SearchFormValues) => {
    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const searchParams = new URLSearchParams();
      if (values.zipcode) searchParams.append('zipCode', values.zipcode);
      if (values.streetAddress) searchParams.append('streetAddress', values.streetAddress);
      searchParams.append('bestMatch', 'true');

      const response = await axios.get(`https://property.corelogicapi.com/v2/properties/search?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data?.items) {
        setSearchResults(response.data.items);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (property: any) => {
    if (onSelectProperty) {
      onSelectProperty(property);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="h2">
          Search Property
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={{
            streetAddress: '',
            city: '',
            state: '',
            zipcode: '',
            apnNumber: '',
          }}
          validationSchema={validationSchema}
          onSubmit={searchProperties}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }: FormikProps<SearchFormValues>) => (
            <Form>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <AutocompleteLocation
                    onSelected={(location: any) => {
                      setFieldValue('streetAddress', location.address || '');
                      setFieldValue('city', location.city || '');
                      setFieldValue('state', location.state || '');
                      setFieldValue('zipcode', location.zipCode || '');
                    }}
                    onRawInput={(input: string) => {
                      setFieldValue('streetAddress', input);
                    }}
                  />
                  {errors.streetAddress && touched.streetAddress && (
                    <Typography color="error" variant="caption" display="block">
                      {errors.streetAddress}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="city"
                    label="City"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    disableClearable={true}
                    options={usaStateOptions}
                    value={usaStateOptions.find(option => option.label === values.state) || undefined}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    onChange={(_event, newValue) => {
                      setFieldValue('state', newValue?.label || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="zipcode"
                    label="Zipcode *"
                    value={values.zipcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.zipcode && Boolean(errors.zipcode)}
                    helperText={touched.zipcode && errors.zipcode}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="apnNumber"
                    label="APN Number"
                    value={values.apnNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || (!values.streetAddress && !values.zipcode)}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Search'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Typography variant="h6" gutterBottom>
              Search Results:
            </Typography>
            <List>
              {searchResults.map((property, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSelectProperty(property)}
                  sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={property.propertyAddress?.streetAddress}
                    secondary={`${property.propertyAddress?.city}, ${property.propertyAddress?.state} ${property.propertyAddress?.zipCode}`}
                  />
                </ListItem>
              ))}
            </List>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertySearchModal;