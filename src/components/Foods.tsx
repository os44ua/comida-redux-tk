/*import { useContext } from "react";
import type { MenuItem } from "../entities/entities";
import { foodItemsContext } from "../App";

 interface FoodsProps { 
   // foodItems: MenuItem[]; 
    onFoodSelected: (food: MenuItem) => void;
} 
function Foods({ onFoodSelected }: FoodsProps) { 
    // utilizamos el contexto en lugar de props
    const foodItems = useContext(foodItemsContext);
    
    return ( 
        <> 
            <h4 className="foodTitle">Carta</h4> 
            <ul className="ulFoods"> 
                {foodItems.map((item) => { 
                    return ( 
                        <li key={item.id} className="liFoods" onClick={() => onFoodSelected(item)}> 
                            <img 
                                className="foodImg" 
                                src={`${import.meta.env.VITE_APP_BASE_URL || '/'}images/${item.image}`} 
                                alt={item.name} 
                            />
                            <div className="foodItem"> 
                                <p className="foodDesc">{item.desc}</p> 
                                <p className="foodPrice">{item.price}€</p> 
                            </div> 
                        </li> 
                    ); 
                })} 
            </ul> 
        </> 
    ); 
}; 
export default Foods; */

// components/Foods.tsx
// Componente de lista de comidas usando Redux
// Компонент списка блюд использующий Redux

import { useMenuItems } from "../store/hooks";
import type { MenuItem } from "../entities/entities";

interface FoodsProps { 
  onFoodSelected: (food: MenuItem) => void;
} 

function Foods({ onFoodSelected }: FoodsProps) { 
  // Obtenemos los items del menú desde Redux en lugar del Context
  // Получаем элементы меню из Redux вместо Context
  const foodItems = useMenuItems();
    
  return ( 
    <> 
      <h4 className="foodTitle">Carta</h4> 
      <ul className="ulFoods"> 
        {foodItems.map((item) => { 
          return ( 
            <li key={item.id} className="liFoods" onClick={() => onFoodSelected(item)}> 
              <img 
                className="foodImg" 
                src={`${import.meta.env.VITE_APP_BASE_URL || '/'}images/${item.image}`} 
                alt={item.name} 
              />
              <div className="foodItem"> 
                <p className="foodDesc">{item.desc}</p> 
                <p className="foodPrice">{item.price}€</p> 
              </div> 
            </li> 
          ); 
        })} 
      </ul> 
    </> 
  ); 
}

export default Foods;