import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

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
        <img
          src="https://app.harkenbov.com/assets/img/favicon.png"
          className="inline-block w-auto h-6 text-gray-300 px-0.5 transform scale-70 filter grayscale"
          alt=""
        />
      </Divider>
    </Root>
  );
}