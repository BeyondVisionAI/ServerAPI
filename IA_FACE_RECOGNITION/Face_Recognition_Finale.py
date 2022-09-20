import face_recognition
import cv2
import numpy as np
import sys
import json
import uuid
import requests
import os
from dotenv import dotenv_values
from os.path import exists

environement = dotenv_values(".env")

class Args:
    video_path = ''
    image_path = []
    send_message = True
    json_finale_path = ''
    idProject = ''

    def __init__(self):
        self.json_finale_path = "../Files/Json/" + str(uuid.uuid1()) + ".json"

    def readingArgs(self):
        it = 0

        for it in range(len(sys.argv)):
            argument = sys.argv[it]
            if argument == '-VP' or argument == '--VideoPath':
                if len(sys.argv) > it + 1:
                    if exists(sys.argv[it + 1]):
                        self.video_path = sys.argv[it + 1]
                    else:
                        print("Error VideoPath : file does not exist at the path given in parameters")
                        exit(84)
                it += 1
            elif argument == "-JI" or argument == '--JsonImage':
                if len(sys.argv) > it + 1:
                    if exists(sys.argv[it + 1]):
                        _json_path = sys.argv[it + 1]

                        with open(_json_path) as json_file:
                            json_object = json.load(json_file)
                            if json_object["images"]:
                                for json_image in json_object["images"]:
                                    if json_image["name"] and json_image["path"]:
                                        if exists(json_image["path"]):
                                            ln = len(self.image_path)
                                            self.image_path.append([])
                                            self.image_path[ln].append(json_image["name"])
                                            self.image_path[ln].append(json_image["path"])
                                        else:
                                            print("Error JsonImage : path file in the json does not exists")
                                            exit(84)
                            else:
                                print("Error JsonImage : can't read properly the information")
                                exit(84)
                    else:
                        print("Error JsonImage : file does not exist at the path given in parameters")
                        exit(84)
            elif argument == "-JP" or argument == '--JsonPath':
                if len(sys.argv) > it + 1:
                    if exists(sys.argv[it + 1]):
                        _json_path = sys.argv[it + 1]
                        self.json_finale_path = _json_path
            elif argument == "-ID" or argument == '--IdProject':
                if len(sys.argv) > it + 1:
                    self.idProject = sys.argv[it + 1]
                else:
                    print("Error IdProject : id project not specified")
                    exit(84)
            elif argument == "-DSM" or argument == '--DontSendMessage':
                self.send_message = False
            it += 1
        if self.idProject == '' and self.send_message:
            print("Error idProject/SendMessage: idProject need to be specified while sending a message to the server.")
            exit(84)
        return 0
    
    def printFiles(self):
        print("Video Path :", self.video_path)
        print("Image :")
        for image in self.image_path:
            if len(image) == 2:
                print("Name:", image[0], "Path :", image[1])
        return 0

def faceRecogniton(args):
    cap = cv2.VideoCapture(args.video_path)

    if not cap.isOpened():
        print("Error opening video file")
        exit (84)
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    fps = cap.get(cv2.CAP_PROP_FPS)
    length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print("Video properties:")
    print("Video Dimension", width, height)
    print("Video FPS:", fps)
    print("Video Frames:", length)
    datas = {"datas": [], "infos":{"fps": fps, "width": width,"height": height}}
    # print("Video Lenght:", cap.get(cv2.CAP_PROPS_SIZE))

# Load the pictures and learn how to recognize it.
    images = []
    known_face_encodings = []
    known_face_names = []
    for _images in args.image_path:
        ln = len(images)
        if len(_images) == 2:
            images.append(face_recognition.load_image_file(_images[1]))
            known_face_encodings.append(face_recognition.face_encodings(images[ln])[0])
            known_face_names.append(_images[0])

# Initialize some variables
    face_locations = []
    face_encodings = []
    face_names = []

    process_this_frame = True
    it_frame = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if ret and process_this_frame:
            datas["datas"].append({str(it_frame): []})
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

            rgb_small_frame = small_frame[:, :, ::-1]
            
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            face_names = []
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"

                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

                face_names.append(name)
            
            it_character = 0
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                width = right - left
                height = bottom - top
                
                datas["datas"][it_frame][str(it_frame)].append({str(it_character):{"name":name,"top":top, "left":left, "width":width,"height":height}})
                
                # print("Frame: " +  str(it_frame) + " | " + str(it_character) + ": " + name)
                it_character += 1
        else:
            progress_bar(it_frame, length)
            break
        # print(datas, end='\n')
        # cv2.imshow("Video", frame)
        # cv2.waitKey(1)
        progress_bar(it_frame, length)
        it_frame += 1
    cap.release()

    with open(args.json_finale_path, 'w', encoding ='utf8') as f:
        json_object = json.dump(datas, f, allow_nan=True)

def progress_bar(progress, total):
    percent = 100 * (float(progress) / float(total))
    bar = '█' * int(percent / 2) + '-' * (50 - int(percent / 2))
    print(f"\r|{bar}| {(percent):.2f}%", end="\r")

def sendFinalMessage(args):
    print("Send data to Server API...")
    data = {'jsonPath': args.json_finale_path}
    server_url = environement['API_SERVER_URL']
    if server_url == '':
        server_url = 'https://localhost:8082'
    try:
        res = requests.post(server_url + '/FaceRecognition/', json=data)
        returned_data = res.json()
        print("Message Recieved:", returned_data['result'])
    except requests.exceptions.RequestException as e:
        print("Request Error: the program can't access the server specified in the variable environment <API_SERVER_URL> :", server_url)
        print(e.message)
        exit(84)
    return 0

def main():
    args = Args()
    args.readingArgs()
    # args.printFiles()
    faceRecogniton(args)
    if args.send_message:
        sendFinalMessage(args)
    return 0

main()