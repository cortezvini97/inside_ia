import onnxruntime as ort
import cv2
import numpy as np
import os
from tqdm import tqdm

class AnimeGAN:
    def __init__(self, model, file_path, device_name=None):
        self.model = f"./models/{model}.onnx"
        self.file_path = file_path
        self.device_name = device_name if device_name is not None else ort.get_device()

        if self.device_name == "CPU":
            self.providers = ['CPUExecutionProvider']
        elif self.device_name == "GPU":
            self.providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']

        self.session = ort.InferenceSession(self.model, providers=self.providers)
    
    def process_image(self, img, x8=True):
        h, w = img.shape[:2]
        if x8: # resize image to multiple of 32s
            def to_8s(x):
                return 256 if x < 256 else x - x%8
            img = cv2.resize(img, (to_8s(w), to_8s(h)))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32)/ 127.5 - 1.0
        return img
    
    def post_precess(self,img, wh):
        img = (img.squeeze()+1.) / 2 * 255
        img = img.astype(np.uint8).clip(0, 255)
        img = cv2.resize(img, (wh[0], wh[1]))
        return img

    def load_test_data(self):
        img0 = cv2.imread(self.file_path)
        img = self.process_image(img0)
        img = np.expand_dims(img, axis=0)
        return img, img0.shape[:2] 
    
    def converter(self, img, scale):
        x = self.session.get_inputs()[0].name
        y = self.session.get_outputs()[0].name
        fake_img = self.session.run(None, {x : img})[0]
        images = (np.squeeze(fake_img) + 1.) / 2 * 255
        images = np.clip(images, 0, 255).astype(np.uint8)
        output_image = cv2.resize(images, (scale[1],scale[0]))
        return cv2.cvtColor(output_image, cv2.COLOR_RGB2BGR)

