import { Button } from '@mikugg/ui-kit';
import React from 'react';
import ReactDOM from 'react-dom';
import CharacterCreationForm from './bot-creation-form';

ReactDOM.render(
  <React.StrictMode>
    <CharacterCreationForm />
    <Button theme='primary'>
      content
    </Button>
  </React.StrictMode>,
  document.getElementById('root')
);
