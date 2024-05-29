import { Router } from 'express'
import { getLibros,saveLibro,updateLibro,deleteLibro } from "../Controllers/LibrosController.js";
import { subirImagen } from "../Middleware/Storage.js"
import {verificar} from '../Middleware/Auth.js'

const rutas = Router()

rutas.get('/api/libros',verificar, getLibros)
rutas.get('/api/libros/:id',verificar, getLibros)
rutas.post('/api/libros',verificar, subirImagen.single('imagen'), saveLibro)
rutas.put('/api/libros/:id',verificar, subirImagen.single('imagen'), updateLibro)
rutas.delete('/api/libros/:id',verificar, deleteLibro)

export default rutas