import { App, VStack, Text, Button } from 'perry/ui'

let n = 0
App({
  title: 'VLStreamCloud',
  width: 390,
  height: 780,
  body: VStack([
    Text('Perry 原型已启动', 'status'),
    Button('+1', () => {
      n++
      console.log('clicked', n)
    })
  ])
})
