// themeReducer.js
const themeReducer = (state, action) => {
    switch (action.type) {
      case 'TOGGLE_THEME':
        return { ...state, darkMode: !state.darkMode };
      default:
        return state;
    }
  };
  
  export default themeReducer;
  