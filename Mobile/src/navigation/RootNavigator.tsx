import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabsNavigator from './TabsNavigator';
import Login from '../screens/Auth/Login';
import RequireAuth from './RequireAuth';
import {useAuthStore} from '../store/auth.store';
import Rutas from '../screens/Rutas/Rutas';
import RutaDetalle from '../screens/Rutas/RutaDetalle';
import RutaMasInformacion from '../screens/Rutas/RutaMasInformacion';
import RutaEvidencias from '../screens/Rutas/RutaEvidencias';
import RutaDestinosCancelados from '../screens/Rutas/RutaDestinosCancelados';
import RutaAsignarConductor from '../screens/Rutas/RutaAsignarConductor';
import Trabajadores from '../screens/Trabajadores/Trabajadores';
import TrabajadorDetalle from '../screens/Trabajadores/TrabajadorDetalle';
import Vehiculos from '../screens/Vehiculos/Vehiculos';
import VehiculoEstado from '../screens/Vehiculos/VehiculoEstado';
import ScreenWithDashboard from '../components/ScreenWithDashboard';
import {theme} from '../theme';

export type RootStackParamList = {
  Login: undefined;
  App: undefined;
  Rutas: undefined;
  Vehiculos: undefined;
  VehiculoEstado: {vehiculoId: number};
  RutaDetalle: {routeId: number};
  RutaMasInformacion: {routeId: number};
  RutaEvidencias: {routeId: number};
  RutaDestinosCancelados: {routeId: number};
  RutaAsignarConductor: {routeId: number};
  Trabajadores: undefined;
  TrabajadorDetalle: {trabajadorId: number};
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const SHARED_PROTECTED_OPTIONS = {
  headerShown: true,
  headerBackVisible: true,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: theme.colors.surface,
  },
  headerTitleStyle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  headerTintColor: theme.colors.text,
  headerBackTitleVisible: false,
} as const;

export default function RootNavigator() {
  const hydrated = useAuthStore(s => s._hydrated);
  const token = useAuthStore(s => s.token);
  const bootstrap = useAuthStore(s => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!hydrated ? (
        // Splash: you can add your own screen here
        <Stack.Screen name="Login" component={Login} />
      ) : token ? (
        <>
          <Stack.Screen name="App">
            {() => (
              <RequireAuth>
                <TabsNavigator />
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen name="Rutas" options={{...SHARED_PROTECTED_OPTIONS, title: 'Rutas'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <Rutas />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen name="Vehiculos" options={{...SHARED_PROTECTED_OPTIONS, title: 'Vehículos'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <Vehiculos />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen name="VehiculoEstado" options={{...SHARED_PROTECTED_OPTIONS, title: 'Estado de Camioneta'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <VehiculoEstado />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen name="RutaDetalle" options={{...SHARED_PROTECTED_OPTIONS, title: 'Detalle de Ruta'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <RutaDetalle />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RutaMasInformacion"
            options={{...SHARED_PROTECTED_OPTIONS, title: 'Mas informacion'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <RutaMasInformacion />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RutaEvidencias"
            options={{...SHARED_PROTECTED_OPTIONS, title: 'Evidencias'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <RutaEvidencias />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RutaDestinosCancelados"
            options={{...SHARED_PROTECTED_OPTIONS, title: 'Servicios pendientes'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <RutaDestinosCancelados />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RutaAsignarConductor"
            options={{...SHARED_PROTECTED_OPTIONS, title: 'Asignar conductor'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <RutaAsignarConductor />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Trabajadores"
            options={{...SHARED_PROTECTED_OPTIONS, title: 'Trabajadores'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <Trabajadores />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="TrabajadorDetalle"
            options={{...SHARED_PROTECTED_OPTIONS, title: 'Detalle del Conductor'}}>
            {props => (
              <RequireAuth>
                <ScreenWithDashboard onMenuPress={() => props.navigation.navigate('App')}>
                  <TrabajadorDetalle />
                </ScreenWithDashboard>
              </RequireAuth>
            )}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}
