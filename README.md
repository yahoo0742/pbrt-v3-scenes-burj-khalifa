CGRA408 2020T1 Final project

This work of this project is based on pbrt library. It is rendering buildings with a infinite area light from a environment map of skylight, which is generated with the Hosek-Wilki model.

To run the project, you should have node installed.
1. copy src/imgtool.cpp to pbrt-v3/src/tools/ to override the existing imgtool.cpp file.
2. build pbrt to a folder, for example "X".
3. copy script/render.js to the folder "X" that the program "pbrt" and "imgtool" are located, which is from step 2.
4. run the command below in the terminal under the folder "X". 
node ./render.js 2048 ../../scenes/burj/pbrt-v3-scenes-burj-khalifa/export.pbrt ./outputs 12
2048 means the height of skylight textures is 2048px, you can set another value.
The next parameter is the relative path to the pbrt file. Here it is just an example, you should provide a correct path.
The next parameter "./outputs" indicates that the output images will be put there.
The last parameter 12 means the program will render the scene with 12 threads. You should spcify it based on your hardware configuration.
This command will render and generate 37 skylight textures under the path to the input pbrt. And also generate 37 images in the output folder you specified.

Currently the resolution of output images is fixed in res/export.pbrt, you can change it there to what you want.



