import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import faviconImg from '../../../public/images/favicon.png';

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  marginTop: '40px',
  marginBottom: '35px',
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  '& > :not(style) ~ :not(style)': {
    marginTop: theme.spacing(2),
  },
}));

export function Hr() {
  return (
    <Root>
      <Divider>
        <div
          className="inline-block w-6 h-6 transform scale-70 filter grayscale"
          style={{
            backgroundImage: `url(${faviconImg})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        ></div>
      </Divider>
    </Root>
  );
}
