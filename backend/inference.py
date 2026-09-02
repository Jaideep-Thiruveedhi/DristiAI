
# exposes one function, predict(), that does everything: takes an image,
# returns severity + confidence + a grad-cam heatmap as a base64 png
#
# needs: torch, torchvision, pillow, numpy, opencv-python, grad-cam
#   pip install torch torchvision pillow numpy opencv-python-headless grad-cam
#
# needs best_model.pth in the same folder (or pass a different path to load_model())

import base64
import io

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_NAMES = {
    0: "No DR",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative DR",
}

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


def load_model(checkpoint_path="best_model.pth", num_classes=5):
    # rebuild the same architecture used in training, then load the trained weights
    # call this once at server startup, not on every request - it's not free
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, num_classes)

    state_dict = torch.load(checkpoint_path, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()
    return model


def _make_heatmap_overlay(model, input_tensor, rgb_image_float):
    # rgb_image_float: HxWx3 numpy array, values 0-1, used as the background for the heatmap
    target_layer = model.features[-1]  # last conv block, standard grad-cam target for efficientnet
    cam = GradCAM(model=model, target_layers=[target_layer])

    grayscale_cam = cam(input_tensor=input_tensor, targets=None)[0]  # targets=None -> uses model's own top prediction
    overlay = show_cam_on_image(rgb_image_float, grayscale_cam, use_rgb=True)

    overlay_pil = Image.fromarray(overlay)
    buf = io.BytesIO()
    overlay_pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def predict(image, model):
    """
    the function to call from the backend.

    image: PIL.Image, file path, or raw bytes - all three work
    model: whatever load_model() returned (load it once, reuse it)

    returns a dict:
        severity       - int, 0-4
        severity_label - str, e.g. "Moderate"
        confidence     - float, 0-1
        heatmap_base64 - base64 png string, send straight to frontend as
                         data:image/png;base64,<this>
    """
    if isinstance(image, (str, bytes)) and not isinstance(image, Image.Image):
        image = Image.open(image if isinstance(image, str) else io.BytesIO(image))
    image = image.convert("RGB")

    resized = image.resize((224, 224))
    rgb_float = np.array(resized).astype(np.float32) / 255.0

    input_tensor = _transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(input_tensor)
        probs = F.softmax(logits, dim=1)[0]
        severity = int(torch.argmax(probs).item())
        confidence = float(probs[severity].item())

    heatmap_base64 = _make_heatmap_overlay(model, input_tensor, rgb_float)

    return {
        "severity": severity,
        "severity_label": CLASS_NAMES[severity],
        "confidence": round(confidence, 4),
        "heatmap_base64": heatmap_base64,
    }


if __name__ == "__main__":
    # quick sanity check - swap in a real fundus image once you have one
    model = load_model("best_model.pth")
    result = predict("sample_fundus.png", model)
    print({k: (v[:30] + "..." if k == "heatmap_base64" else v) for k, v in result.items()})
