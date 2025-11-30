import { useCallback, useState, useRef } from 'react'
import { StylesheetsRepository } from '@enhanced-dom/css'

import { ScrollbarWebComponent } from '../src'
import { Scrollbar } from './scrollbar.component'
import * as styles from './app.pcss'

const stylesheetsRepository = new StylesheetsRepository(document)
stylesheetsRepository.setProperty('demo-styles', ':root', Scrollbar.cssVariables.scrollSize, '1000px')

stylesheetsRepository.setProperty('demo-styles', ':root', Scrollbar.cssVariables.scrollbarThumb, 'blue')

stylesheetsRepository.setProperty('demo-styles', ':root', Scrollbar.cssVariables.scrollbarTrack, 'red')

const App = () => {
  const [value, setValue] = useState<number>(0)
  const dimension = useRef(1000)
  const increaseDimension = useCallback(() => {
    dimension.current = dimension.current + 100
    stylesheetsRepository.setProperty('demo-styles', ':root', Scrollbar.cssVariables.scrollSize, `${dimension.current}px`)
  }, [dimension])
  const scrollbarRef = useRef<ScrollbarWebComponent>(null)
  const resetScroll = useCallback(() => {
    if (scrollbarRef.current) {
      scrollbarRef.current.value = 0
    }
  }, [scrollbarRef])
  const handleScroll = useCallback(
    (e: any) => {
      setValue(e.target.value)
    },
    [setValue],
  )
  return (
    <div className={styles.container}>
      <div className={styles.scrollbarWrapper}>
        <Scrollbar ref={scrollbarRef} value={value} onScroll={handleScroll} orientation={Scrollbar.orientations.HORIZONTAL} />
      </div>
      <p>{`Scroll value is ${value}`}</p>
      <button onClick={increaseDimension}>bigger</button>
      <button onClick={resetScroll}>reset scroll</button>
    </div>
  )
}

export default App
