import { ScrollbarDemoWebComponent } from './scrollbar-demo.webcomponent'

ScrollbarDemoWebComponent.register()

document.getElementById('root')!.appendChild(document.createElement(ScrollbarDemoWebComponent.tag))
