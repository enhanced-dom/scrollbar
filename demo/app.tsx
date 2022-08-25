import React, { useCallback, useState } from 'react'
import { StylesheetsRepository } from '@enhanced-dom/css'

import Scrollbar from './scrollbar.component'
import * as styles from './app.pcss'

const stylesheetsRepository = new StylesheetsRepository(document)
stylesheetsRepository.setProperty(styles._stylesheetName, styles.container, Scrollbar.cssVariables.scrollSize, '1000px')

stylesheetsRepository.setProperty(styles._stylesheetName, styles.container, Scrollbar.cssVariables.scrollbarThumb, 'blue')

stylesheetsRepository.setProperty(styles._stylesheetName, styles.container, Scrollbar.cssVariables.scrollbarTrack, 'red')

const App = () => {
  const [value, setValue] = useState<number>(0)
  const handleScroll = useCallback(
    (e: any) => {
      setValue(e.target.value)
      // console.log(`caught scroll change ${e.target.value}`)
    },
    [setValue],
  )
  return (
    <div className={styles.container}>
      <div className={styles.scrollbarWrapper}>
        <Scrollbar onScroll={handleScroll} orientation={Scrollbar.orientations.horizontal} />
      </div>
      <p>{`Scroll value is ${value}`}</p>
    </div>
  )
}

export default App
