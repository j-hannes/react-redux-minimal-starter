import React from 'react'
import ReactDOM from 'react-dom'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { syncReduxAndRouter } from 'redux-simple-router'
import Root from './containers/Root'
import configureStore from './store/configureStore'

import 'bootstrap/dist/css/bootstrap.css'

const target = document.getElementById('root')
const history = createBrowserHistory()
const store = configureStore(window.__INITIAL_STATE__, true)

syncReduxAndRouter(history, store)

const node = (
  <Root
    history={history}
    store={store}
  />
)

ReactDOM.render(node, target)
