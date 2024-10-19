import numpy as np
from PIL import Image
import open3d as o3d
import os
import cv2  # Ensure OpenCV is installed
import matplotlib.pyplot as plt  # For visualization
import argparse

def generate_height_map(image_path, alpha_threshold=10):
    """
    Generates a height map from the alpha channel of an image, inverts the colors of the original image,
    and crops the image to the non-transparent region.

    :param image_path: Path to the input image with transparency.
    :param alpha_threshold: Threshold to consider a pixel as opaque.
    :return: Tuple of (cropped height map, cropped and color-inverted RGB image).
    """
    # Load the image with transparency
    image = Image.open(image_path).convert('RGBA')

    # Convert to numpy array
    image_array = np.array(image)

    # Extract the alpha channel (transparency)
    alpha_channel = image_array[:, :, 3]

    # Create a mask where alpha > threshold
    mask = alpha_channel > alpha_threshold

    # Apply morphological operations to clean up the mask
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, kernel)

    # Find bounding box of the mask
    coords = np.argwhere(mask)
    if coords.size == 0:
        raise ValueError("No opaque pixels found in the image.")
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1  # slices are exclusive at the top

    # Crop the image to the bounding box
    cropped_image = image.crop((x0, y0, x1, y1))

    # Flip the cropped image vertically to align with 3D coordinate system
    cropped_image = cropped_image.transpose(Image.FLIP_TOP_BOTTOM)

    # Convert the flipped image to numpy array
    cropped_array = np.array(cropped_image)

    # Invert the RGB channels (keep alpha channel unchanged)
    # cropped_array[:, :, :3] = 255 - cropped_array[:, :, :3]

    # Extract the alpha channel of the cropped image
    cropped_alpha = cropped_array[:, :, 3]

    # Use the alpha channel directly as the height map (opaque pixels have higher heights)
    height_map = cropped_alpha.astype(np.float32) / 255.0  # Normalize to [0, 1]

    # Extract the color image (RGB)
    color_image = cropped_array[:, :, :3]

    return height_map, color_image  # Return height map and inverted RGB channels

def height_map_to_mesh(height_map, color_image, scale=(1.0, 1.0, 1.0)):
    """
    Converts a height map and corresponding color image to a 3D mesh.

    :param height_map: 2D NumPy array representing the height map.
    :param color_image: 3D NumPy array representing the RGB color image.
    :param scale: Tuple to scale the mesh in (x, y, z) directions.
    :return: Open3D TriangleMesh object.
    """
    rows, cols = height_map.shape
    vertices = []
    triangles = []
    colors = []

    # Create a mapping from (i, j) to vertex index
    grid_to_vertex = {}
    vertex_index = 0

    # Generate vertices and colors
    for i in range(rows):
        for j in range(cols):
            z = height_map[i, j] * scale[2]
            if z == 0:
                continue  # Skip transparent vertices
            x = j * scale[0]
            y = i * scale[1]  # No inversion needed after flipping
            vertices.append([x, y, z])
            colors.append(color_image[i, j] / 255.0)
            grid_to_vertex[(i, j)] = vertex_index
            vertex_index += 1

    # Generate triangles (two triangles per grid cell)
    for i in range(rows - 1):
        for j in range(cols - 1):
            # Check if all four corners have vertices
            if (i, j) in grid_to_vertex and (i + 1, j) in grid_to_vertex and \
               (i, j + 1) in grid_to_vertex and (i + 1, j + 1) in grid_to_vertex:
                idx = grid_to_vertex[(i, j)]
                idx_down = grid_to_vertex[(i + 1, j)]
                idx_right = grid_to_vertex[(i, j + 1)]
                idx_diag = grid_to_vertex[(i + 1, j + 1)]
                # Triangle 1
                triangles.append([idx, idx_down, idx_diag])
                # Triangle 2
                triangles.append([idx, idx_diag, idx_right])

    if not triangles:
        raise ValueError("No triangles were created. Check if the height map has sufficient non-zero heights.")

    vertices = np.array(vertices)
    triangles = np.array(triangles)
    colors = np.array(colors)

    # Create Open3D mesh
    mesh = o3d.geometry.TriangleMesh()
    mesh.vertices = o3d.utility.Vector3dVector(vertices)
    mesh.triangles = o3d.utility.Vector3iVector(triangles)
    mesh.vertex_colors = o3d.utility.Vector3dVector(colors)

    # Remove unreferenced vertices (optional, for cleanup)
    mesh.remove_unreferenced_vertices()

    # Compute normals for better visualization
    mesh.compute_vertex_normals()

    return mesh

def save_mesh(mesh, output_path):
    """
    Saves the mesh to a file.

    :param mesh: Open3D TriangleMesh object.
    :param output_path: Path to save the mesh (e.g., 'model.obj').
    """
    o3d.io.write_triangle_mesh(output_path, mesh)
    print(f"Mesh saved to {output_path}")

def generate_3d_model(image_path, output_mesh_path, scale=(1.0, 1.0, 1.0), alpha_threshold=10, downscale_factor=1):
    """
    Complete pipeline to generate a 3D model from a 2D image.

    :param image_path: Path to the input image with transparency.
    :param output_mesh_path: Path to save the output 3D model (e.g., 'model.obj').
    :param scale: Tuple to scale the mesh in (x, y, z) directions.
    :param alpha_threshold: Threshold to consider a pixel as opaque.
    :param downscale_factor: Factor to downscale the image to reduce mesh complexity.
    """
    # Load and process the image
    height_map, color_image = generate_height_map(image_path, alpha_threshold=alpha_threshold)

    # Optional: Downscale the height map and color image
    if downscale_factor > 1:
        try:
            resample_filter = Image.Resampling.LANCZOS
        except AttributeError:
            # For older Pillow versions
            resample_filter = Image.LANCZOS

        # Downscale height map
        height_map_img = Image.fromarray((height_map * 255).astype(np.uint8)).resize(
            (height_map.shape[1] // downscale_factor, height_map.shape[0] // downscale_factor),
            resample=resample_filter
        )
        height_map = np.array(height_map_img) / 255.0

        # Downscale color image
        color_image_pil = Image.fromarray((color_image * 255).astype(np.uint8)).resize(
            (color_image.shape[1] // downscale_factor, color_image.shape[0] // downscale_factor),
            resample=resample_filter
        )
        color_image = np.array(color_image_pil)

    # Debugging: Visualize the cropped image and height map
    # Uncomment the following lines if you want to see the images
    """
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.title("Cropped and Color-Inverted Image (Flipped)")
    plt.imshow(color_image)
    plt.axis('off')

    plt.subplot(1, 2, 2)
    plt.title("Cropped Height Map (Flipped)")
    plt.imshow(height_map, cmap='gray')
    plt.axis('off')

    plt.show()
    """

    # Generate the mesh
    mesh = height_map_to_mesh(height_map, color_image, scale)

    # Save the mesh
    save_mesh(mesh, output_mesh_path)

    # Optional: Visualize the mesh
    # o3d.visualization.draw_geometries([mesh])


# Main execution
if __name__ == "__main__":
    # Argument parsing
    parser = argparse.ArgumentParser(description='Convert 2D image to 3D mesh.')
    parser.add_argument('image_path', type=str, help='Path to the input 2D image')
    parser.add_argument('output_mesh_path', type=str, help='Path to save the output 3D mesh')
    parser.add_argument('--scale', nargs=3, type=float, default=[1.0, 1.0, 1.0], help='Scale factors for x, y, z axes')
    parser.add_argument('--alpha_threshold', type=int, default=10, help='Alpha threshold for transparency')
    parser.add_argument('--downscale_factor', type=int, default=1, help='Factor to downscale the image for mesh generation')

    args = parser.parse_args()

    # Call the function to generate 3D model
    generate_3d_model(
        image_path=args.image_path,
        output_mesh_path=args.output_mesh_path,
        scale=args.scale,
        alpha_threshold=args.alpha_threshold,
        downscale_factor=args.downscale_factor
    )