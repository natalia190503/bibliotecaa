import mongoose from "mongoose";
import * as fs from 'fs'

const esquema = new mongoose.Schema({
    titulo:String, imagen:String, descripcion:String,autores:String,editorial:String,paginas:Number,fecha_publicacion:Date
},{versionKey:false})
const LibroModel = new mongoose.model('libros',esquema)

export const getLibros = async(req,res)=>{
    try{
        const{id} = req.params
        const rows = 
        (id === undefined) ? await LibroModel.find() : await LibroModel.findById(id)
        return res.status(200).json({status:true, data:rows})

    }
    catch(error){
        return res.status(500).json({status: false, errors:[error]})
    }
}



export const saveLibro = async(req, res)=>{
    try{
        const {titulo, descripcion, autores,editorial,paginas,fecha_publicacion} = req.body
        const validacion = validar(titulo, descripcion, autores,editorial,paginas,fecha_publicacion,req.file,'Y')
            if(validacion == ''){
                const nuevoLibro = new LibroModel({
                    titulo:titulo,descripcion:descripcion, autores:autores,editorial:editorial,paginas:paginas,fecha_publicacion:fecha_publicacion,
                    imagen:'/uploads/'+req.file.filename
                })
                return await nuevoLibro.save().then(
                    () => {res.status(200).json({status:true,message: 'Libro guardado'})}
                )
            }
            else{
                return res.status(400).json({status:false,errors:validacion})
            }
    }
    catch(error){
        return res.status(500).json({status:false,errors:[error.message]})
    }
}


export const updateLibro = async(req, res)=>{
    try{
        const {id} = req.params
        const {titulo, descripcion, autores,editorial,paginas,fecha_publicacion} = req.body
        let imagen = ''
        let valores = { titulo:titulo,descripcion:descripcion, autores:autores,editorial:editorial,paginas:paginas,fecha_publicacion:fecha_publicacion}
        if(req.file != null){
            imagen = '/uploads/'+req.file.filename
            valores = {  titulo:titulo,descripcion:descripcion, autores:autores,editorial:editorial,paginas:paginas,fecha_publicacion:fecha_publicacion, imagen:imagen}
            await eliminarImagen(id)
        }
        const validacion = validar(titulo, descripcion, autores,editorial,paginas,fecha_publicacion)
            if(validacion == ''){
                await LibroModel.updateOne({_id:id},{$set: valores})
                return res.status(200).json({status:true,message: 'Libro actualizado'})
            }
            else{
                return res.status(400).json({status:false,errors:validacion})
            }
    }
    catch(error){
        return res.status(500).json({status:false,errors:[error.message]})
    }
}

export const deleteLibro = async(req,res) =>{
    try{
        const {id} =req.params
        await eliminarImagen(id)
        await LibroModel.deleteOne({_id:id})
        return res.status(200).json({status:true, message:'Libro eliminado'})
    }
    catch(error){
        return res.status(500).json({status:false, errors:[error,message]})
    }
}

const eliminarImagen = async(id) =>{
    const libro = await LibroModel.findById(id)
    const img = libro.imagen
    fs.unlinkSync('./public/'+img)
}

const validar = (titulo, descripcion, autores,editorial,paginas,fecha_publicacion,img,sevalida)=>{
    var errors = []
    if(titulo === undefined || titulo.trim() === ''){
        errors.push('El titulo NO debe de estar vacio')
    }
    if(descripcion === undefined || descripcion.trim() === ''){
        errors.push('La descripción NO debe de estar vacio')
    }
    if(autores === undefined || autores.trim() === ''){
        errors.push('El autor NO debe de estar vacio')
    }
    if(editorial === undefined || editorial.trim() === ''){
        errors.push('El editorial NO debe de estar vacio')
    }
    if(paginas === undefined || paginas.trim() === '' || isNaN(paginas)){
        errors.push('El número de paginas NO debe de estar vacio y debe ser númerico')
    }
    if(fecha_publicacion === undefined || fecha_publicacion.trim() === ''||isNaN(Date.parse(fecha_publicacion))){
        errors.push('La fecha de publicación NO debe de estar vacio y debe ser fecha valida')
    }
    if(sevalida === 'Y' && img === undefined){
        errors.push('Selecciona una imagen en formato jpg o png')
    }
    else{
        if(errors != ''){
            fs.unlinkSync('./public/uploads/'+img.filename)
        }
    }
    return errors
}