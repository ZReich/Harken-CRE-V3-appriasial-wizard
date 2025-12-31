// import * as React from 'react';
// import { useState, useEffect } from 'react';
// import { ChromePicker, ColorResult } from 'react-color';
// import { useFormikContext } from 'formik';

// interface ListPickers {
//   id: string;
//   hexColor: string;
//   newhexColor?: string;
//   ref: React.RefObject<unknown>;
//   showPicker: boolean;
// }
// export default function ChooseColor() {
//   const { values } = useFormikContext<any>();

//   const d =
//     values.theme === 'default'
//       ? ['#0da1c7', '#008db3', '#00799f']
//       : values.theme === 'nai'
//         ? ['#af2d37', '#9b1923', '#87050f']
//         : values.theme === 'nai_portland'
//           ? ['#63666a', '#4f5256', '#3b3e42']
//           : ['#006f51', '#005b3d', '#004729'];

//   const [Data, SetData] = useState<string[]>(d);

//   const a = [
//     'Choose Primary Color',
//     'Choose Secondary Color',
//     'Choose Tertiary Color',
//   ];
//   const [ActiveColor, setActiveColor] = useState<string>('');
//   const [DataList, setDataList] = useState<ListPickers[]>([]);

//   useEffect(() => {
//     SetData(d);
//   }, [values.theme]);

//   const hidePicker = (id: string) => {
//     const currentList: ListPickers[] = [];
//     DataList.forEach((item) => {
//       if (item.id === id) {
//         item.showPicker = false;
//       }
//       currentList.push(item);
//     });
//     setDataList(currentList);
//   };

//   const showPicker = (id: string) => {
//     const currentList: ListPickers[] = [];
//     DataList.forEach((item) => {
//       if (item.id === id) {
//         item.showPicker = !item.showPicker;
//         item.hexColor = ActiveColor;
//       }
//       currentList.push(item);
//     });
//     setDataList(currentList);
//   };

//   useEffect(() => {
//     createList();
//   }, [Data]);

//   useEffect(() => {
//     // document.body.style.backgroundColor = ActiveColor;
//     if (Data) {
//       console.log('list is filled and created');
//       //createList();
//     }
//   }, [ActiveColor]);

//   const createList = () => {
//     const dataList: ListPickers[] = [];
//     Data.map((color: string, index: number) => {
//       const listPickers: ListPickers | undefined = {
//         id: index.toString(),
//         hexColor: color,
//         ref: React.createRef(),
//         showPicker: false,
//       };
//       dataList?.push(listPickers);
//     });
//     setDataList(dataList);
//   };

//   const handlerOnColorChange = (color: ColorResult, id: string) => {
//     //const activColor = rgbToHex(color.rgb.r, color.rgb.g, color.rgb.b);
//     const currentList: ListPickers[] = [];
//     DataList.forEach((item) => {
//       if (item.id === id) item.hexColor = color.hex;
//       currentList.push(item);
//     });
//     setDataList(currentList);
//     setActiveColor(color.hex);
//   };

//   const ColorBox = (props: {
//     id: string;
//     colorHax: string;
//     onclick(event?: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
//     ref: any;
//   }) => (
//     <>
//       <div
//         id={props.id}
//         ref={props.ref}
//         onClick={(e) => props.onclick(e)}
//         style={{
//           width: 700,
//           height: 40,
//           marginBottom: 10,
//           // marginLeft: 10,
//           boxShadow: '3px 3px 3px #9E9E9E',
//           backgroundColor: props.colorHax,
//         }}
//       >
//         {/* {props.colorHax} */}
//       </div>
//     </>
//   );

//   return (
//     <div>
//       {DataList?.map((item, index) => {
//         return (
//           <div className="mt-5">
//             <label className="text-sm font-normal">{a[index]}</label>
//             <ColorBox
//               id={`box[${item.id}]`}
//               ref={item.ref}
//               onclick={() => showPicker(item.id)}
//               colorHax={item.hexColor}
//             />
//             {/* onClick={() => hidePicker(item.id)} */}
//             <div className="color-area">
//               {item.showPicker ? (
//                 <div style={{ position: 'absolute', zIndex: 2 }}>
//                   <div
//                     onClick={() => hidePicker(item.id)}
//                     style={{
//                       position: 'fixed',
//                       top: '0px',
//                       right: '0px',
//                       bottom: '0px',
//                       left: '0px',
//                     }}
//                   />
//                   <ChromePicker
//                     color={item.hexColor}
//                     onChange={(e) => handlerOnColorChange(e, item.id)}
//                   />
//                 </div>
//               ) : null}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

import { useEffect, useRef, useState } from 'react';
import { useFormikContext } from 'formik';

interface ColorItem {
  id: string;
  label: string;
  hexColor: string;
  role: 'primary' | 'secondary' | 'tertiary';
}

export default function ChooseColor() {
  const { values, setFieldValue } = useFormikContext<any>();
  const [colorList, setColorList] = useState<ColorItem[]>([]);

  const initialized = useRef(false);
  const apiThemeColorMap = useRef<{ [theme: string]: string[] }>({});

  const getThemeColors = (theme: string): string[] => {
    switch (theme) {
      case 'default':
        return ['#0da1c7', '#008db3', '#00799f'];
      case 'nai':
        return ['#af2d37', '#9b1923', '#87050f'];
      case 'nai_portland':
        return ['#63666a', '#4f5256', '#3b3e42'];
      default:
        return ['#006f51', '#005b3d', '#004729'];
    }
  };

  // STEP 1: Store API colors per theme (first time only)
  useEffect(() => {
    if (!initialized.current) {
      const theme = values.theme;

      if (
        values.primary_color &&
        values.secondary_color &&
        values.tertiary_color
      ) {
        const apiColors = [
          values.primary_color,
          values.secondary_color,
          values.tertiary_color,
        ];

        // Save these colors against the theme name
        apiThemeColorMap.current[theme] = [...apiColors];

        const initialColorList: ColorItem[] = apiColors.map((color, index) => ({
          id: String(index),
          label:
            index === 0
              ? 'Choose Primary Color'
              : index === 1
              ? 'Choose Secondary Color'
              : 'Choose Tertiary Color',
          hexColor: color,
          role: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary',
        }));

        setColorList(initialColorList);
        initialized.current = true;
      } else if (theme === 'default') {
        const defaultColors = getThemeColors('default');
        apiThemeColorMap.current['default'] = [...defaultColors];

        const fallbackColorList: ColorItem[] = defaultColors.map(
          (color, index) => ({
            id: String(index),
            label:
              index === 0
                ? 'Choose Primary Color'
                : index === 1
                ? 'Choose Secondary Color'
                : 'Choose Tertiary Color',
            hexColor: color,
            role:
              index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary',
          })
        );

        setColorList(fallbackColorList);
        setFieldValue('primary_color', defaultColors[0]);
        setFieldValue('secondary_color', defaultColors[1]);
        setFieldValue('tertiary_color', defaultColors[2]);

        initialized.current = true;
      }
    }
  }, [
    values.primary_color,
    values.secondary_color,
    values.tertiary_color,
    values.theme,
  ]);

  // STEP 2: When theme changes, either restore API-provided colors OR fallback to hardcoded
  useEffect(() => {
    if (!initialized.current) return;

    const theme = values.theme;

    // ✅ CASE 1: Theme exists in API theme map (either from API or earlier user update)
    if (apiThemeColorMap.current[theme]) {
      const themeColors = apiThemeColorMap.current[theme];

      const updatedColorList: ColorItem[] = themeColors.map((color, index) => ({
        id: String(index),
        label:
          index === 0
            ? 'Choose Primary Color'
            : index === 1
            ? 'Choose Secondary Color'
            : 'Choose Tertiary Color',
        hexColor: color,
        role: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary',
      }));

      setColorList(updatedColorList);
      setFieldValue('primary_color', themeColors[0]);
      setFieldValue('secondary_color', themeColors[1]);
      setFieldValue('tertiary_color', themeColors[2]);
    }

    // ✅ CASE 2: Theme not found → use hardcoded theme colors and store them
    else {
      const fallbackColors = getThemeColors(theme);

      apiThemeColorMap.current[theme] = [...fallbackColors];

      const fallbackColorList: ColorItem[] = fallbackColors.map(
        (color, index) => ({
          id: String(index),
          label:
            index === 0
              ? 'Choose Primary Color'
              : index === 1
              ? 'Choose Secondary Color'
              : 'Choose Tertiary Color',
          hexColor: color,
          role:
            index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary',
        })
      );

      setColorList(fallbackColorList);
      setFieldValue('primary_color', fallbackColors[0]);
      setFieldValue('secondary_color', fallbackColors[1]);
      setFieldValue('tertiary_color', fallbackColors[2]);
    }
  }, [values.theme]);

  function LightenDarkenColor(hex: string, amt: number) {
    return (
      '#' +
      hex
        .replace(/^#/, '')
        .replace(/../g, (color) =>
          (
            '0' +
            Math.min(255, Math.max(0, parseInt(color, 16) + amt)).toString(16)
          ).slice(-2)
        )
    );
  }

  const handlePrimaryColorChange = (newColor: string) => {
    const updated = colorList.map((item) => {
      if (item.role === 'primary') return { ...item, hexColor: newColor };
      if (item.role === 'secondary')
        return { ...item, hexColor: LightenDarkenColor(newColor, -20) };
      if (item.role === 'tertiary')
        return { ...item, hexColor: LightenDarkenColor(newColor, -40) };
      return item;
    });

    const newThemeColors = [
      newColor,
      LightenDarkenColor(newColor, -20),
      LightenDarkenColor(newColor, -40),
    ];

    setColorList(updated);
    setFieldValue('primary_color', newThemeColors[0]);
    setFieldValue('secondary_color', newThemeColors[1]);
    setFieldValue('tertiary_color', newThemeColors[2]);

    // Update the current theme color map with user changes
    apiThemeColorMap.current[values.theme] = [...newThemeColors];
  };

  const handleManualColorChange = (index: number, newColor: string) => {
    const updated = [...colorList];
    updated[index].hexColor = newColor;
    setColorList(updated);

    const role = updated[index].role;
    if (role === 'primary') setFieldValue('primary_color', newColor);
    else if (role === 'secondary') setFieldValue('secondary_color', newColor);
    else if (role === 'tertiary') setFieldValue('tertiary_color', newColor);

    // Update the color map for this theme
    const updatedThemeColors = [...updated.map((c) => c.hexColor)];
    apiThemeColorMap.current[values.theme] = [...updatedThemeColors];
  };

  return (
    <div>
      {colorList.map((item, index) => (
        <div key={item.id} style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '13px', color: '#757575' }}>
            {item.label}
          </label>
          <div
            style={{
              position: 'relative',
              width: '40%',
              height: '40px',
              marginTop: '8px',
              boxShadow: '3px 3px 3px #9E9E9E',
              backgroundColor: item.hexColor,
            }}
          >
            <input
              type="color"
              value={item.hexColor}
              onChange={(e) => {
                const color = e.target.value;
                if (item.role === 'primary') {
                  handlePrimaryColorChange(color);
                } else {
                  handleManualColorChange(index, color);
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </div>
          <hr style={{ marginTop: '8px', width: '40%' }} />
        </div>
      ))}
    </div>
  );
}







